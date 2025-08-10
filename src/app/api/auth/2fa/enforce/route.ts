import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { isTwoFactorRequiredForRole } from '@/lib/auth/twoFactor';

/**
 * Check if 2FA enforcement is required for a user based on their role
 */
export async function GET(req: NextRequest) {
  try {
    if (!admin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get user from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const auth = getAuth(admin);
    const db = getFirestore(admin);

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authorization token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userRole = userData.role || 'user';
    const isAdmin = isTwoFactorRequiredForRole(userRole);
    const has2FA = userData.twoFactorEnabled || false;

    // Check if enforcement is required
    const enforcementRequired = isAdmin && !has2FA;

    return NextResponse.json({
      enforcementRequired,
      isAdminUser: isAdmin,
      hasTwoFactor: has2FA,
      userRole,
      gracePeriodDays: enforcementRequired ? 7 : 0, // 7 days to enable 2FA
      message: enforcementRequired 
        ? 'Two-factor authentication is required for admin accounts. You have 7 days to enable it.'
        : has2FA 
          ? 'Two-factor authentication is active.'
          : 'Two-factor authentication is optional for your account.'
    });

  } catch (error) {
    logger.error('2FA enforcement check failed:', error);
    return NextResponse.json(
      { error: 'Unable to check 2FA enforcement status' },
      { status: 500 }
    );
  }
}

/**
 * Enforce 2FA for admin users (can be called during sensitive operations)
 */
export async function POST(req: NextRequest) {
  try {
    if (!admin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get user from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const auth = getAuth(admin);
    const db = getFirestore(admin);

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authorization token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    const body = await req.json();
    const { operation } = body;

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userRole = userData.role || 'user';
    const isAdmin = isTwoFactorRequiredForRole(userRole);
    const has2FA = userData.twoFactorEnabled || false;

    // Check if this operation requires 2FA for this user
    if (isAdmin && !has2FA) {
      logger.warn('Admin user attempted sensitive operation without 2FA', { 
        userId, 
        operation, 
        userRole 
      });
      
      return NextResponse.json(
        { 
          error: 'Two-factor authentication is required for admin accounts to perform this operation',
          requiresSetup: true,
          enforcementRequired: true
        },
        { status: 403 }
      );
    }

    // Verify 2FA was completed recently for sensitive operations
    const twoFactorVerified = decodedToken.twoFactorVerified;
    const twoFactorVerifiedAt = decodedToken.twoFactorVerifiedAt;
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 10 * 60; // 10 minutes

    if (has2FA && (!twoFactorVerified || !twoFactorVerifiedAt || now - twoFactorVerifiedAt > maxAge)) {
      return NextResponse.json(
        { 
          error: 'Recent two-factor authentication verification required for this operation',
          requiresVerification: true,
          maxAge: maxAge
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      allowed: true,
      message: 'Operation authorized'
    });

  } catch (error) {
    logger.error('2FA enforcement failed:', error);
    return NextResponse.json(
      { error: 'Unable to enforce 2FA requirements' },
      { status: 500 }
    );
  }
}