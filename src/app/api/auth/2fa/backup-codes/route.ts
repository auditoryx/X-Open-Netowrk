import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { generateBackupCodes, verifyTwoFactorToken, twoFactorRateLimiter } from '@/lib/auth/twoFactor';
import { z } from 'zod';
import { requireFeatureFlag } from '@/lib/featureFlags';

const regenerateBackupCodesSchema = z.object({
  token: z.string().min(1, 'Current 2FA token is required'),
  password: z.string().min(1, 'Current password is required').optional()
});

/**
 * GET - Get current backup codes status
 */
export const GET = requireFeatureFlag('ENABLE_2FA')(async (req: NextRequest) => {
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

    if (!userData?.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is not enabled' },
        { status: 400 }
      );
    }

    const backupCodes = userData.twoFactorBackupCodes || [];

    return NextResponse.json({
      backupCodesCount: backupCodes.length,
      hasBackupCodes: backupCodes.length > 0,
      totalGenerated: 10,
      lastGenerated: userData.twoFactorEnabledAt || userData.backupCodesLastGenerated
    });

  } catch (error) {
    logger.error('Backup codes status check failed:', error);
    return NextResponse.json(
      { error: 'Unable to check backup codes status' },
      { status: 500 }
    );
  }
});

/**
 * POST - Regenerate backup codes
 */
export const POST = requireFeatureFlag('ENABLE_2FA')(async (req: NextRequest) => {
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

    // Check rate limiting
    if (twoFactorRateLimiter.isRateLimited(userId)) {
      const resetTime = twoFactorRateLimiter.getResetTime(userId);
      return NextResponse.json(
        { 
          error: 'Too many failed attempts. Please try again later.',
          resetTime: Math.ceil(resetTime / 1000 / 60) // minutes
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { token: totpToken } = regenerateBackupCodesSchema.parse(body);

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is not enabled' },
        { status: 400 }
      );
    }

    const secret = userData.twoFactorSecret;
    const currentBackupCodes = userData.twoFactorBackupCodes || [];

    // Verify the TOTP token or backup code
    const verificationResult = verifyTwoFactorToken(totpToken, secret, currentBackupCodes);
    
    if (!verificationResult.isValid) {
      twoFactorRateLimiter.recordFailedAttempt(userId);
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // Reset rate limiting on successful verification
    twoFactorRateLimiter.resetAttempts(userId);

    // Generate new backup codes
    const newBackupCodes = generateBackupCodes(10);
    
    // Update user document with new backup codes
    await db.collection('users').doc(userId).set({
      twoFactorBackupCodes: newBackupCodes,
      backupCodesLastGenerated: new Date().toISOString()
    }, { merge: true });

    logger.info('2FA backup codes regenerated', { 
      userId, 
      previousCount: currentBackupCodes.length,
      newCount: newBackupCodes.length
    });

    return NextResponse.json({
      message: 'Backup codes have been regenerated successfully',
      backupCodes: newBackupCodes,
      count: newBackupCodes.length,
      warning: 'Please save these new backup codes securely. Your previous backup codes are no longer valid.'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    logger.error('Backup codes regeneration failed:', error);
    return NextResponse.json(
      { error: 'Unable to regenerate backup codes' },
      { status: 500 }
    );
  }
});