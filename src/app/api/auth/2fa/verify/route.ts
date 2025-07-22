import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { authenticator } from 'otplib';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const verifyTwoFASchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits').regex(/^\d+$/, 'Token must contain only numbers')
});

// Generate backup codes
function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

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
    const { token: totpToken } = verifyTwoFASchema.parse(body);

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.twoFactorSetupInProgress) {
      return NextResponse.json(
        { error: 'Two-factor authentication setup not initiated' },
        { status: 400 }
      );
    }

    if (userData.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is already enabled' },
        { status: 400 }
      );
    }

    const secret = userData.twoFactorSecret;
    if (!secret) {
      return NextResponse.json(
        { error: 'No 2FA secret found. Please restart setup.' },
        { status: 400 }
      );
    }

    // Verify the TOTP token
    const isValid = authenticator.check(totpToken, secret);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    
    // Enable 2FA and store backup codes
    await db.collection('users').doc(userId).set({
      twoFactorEnabled: true,
      twoFactorSetupInProgress: false,
      twoFactorBackupCodes: backupCodes,
      twoFactorEnabledAt: new Date().toISOString()
    }, { merge: true });

    // Update custom claims to include 2FA status
    await auth.setCustomUserClaims(userId, {
      ...decodedToken,
      twoFactorEnabled: true
    });

    logger.info('2FA successfully enabled', { userId });

    return NextResponse.json({
      message: 'Two-factor authentication enabled successfully',
      backupCodes: backupCodes,
      enabled: true
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    logger.error('2FA verification failed:', error);
    return NextResponse.json(
      { error: 'Unable to verify two-factor authentication code' },
      { status: 500 }
    );
  }
}