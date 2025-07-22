import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { authenticator } from 'otplib';
import { z } from 'zod';

const disableTwoFASchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  password: z.string().min(1, 'Current password is required')
});

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
    const { token: totpToken, password } = disableTwoFASchema.parse(body);

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
    const backupCodes = userData.twoFactorBackupCodes || [];

    // Check if token is a TOTP code or backup code
    let isValid = false;
    let usedBackupCode = null;

    if (totpToken.length === 6 && /^\d+$/.test(totpToken)) {
      // TOTP token
      isValid = authenticator.check(totpToken, secret);
    } else if (totpToken.length === 8 && /^[A-F0-9]+$/.test(totpToken.toUpperCase())) {
      // Backup code
      const upperToken = totpToken.toUpperCase();
      if (backupCodes.includes(upperToken)) {
        isValid = true;
        usedBackupCode = upperToken;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code or backup code' },
        { status: 400 }
      );
    }

    // TODO: Verify password as well for extra security
    // This would require storing password hashes or using Firebase Auth

    // Remove backup code if used
    let remainingBackupCodes = backupCodes;
    if (usedBackupCode) {
      remainingBackupCodes = backupCodes.filter((code: string) => code !== usedBackupCode);
    }

    // Disable 2FA
    await db.collection('users').doc(userId).set({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      twoFactorSetupInProgress: false,
      twoFactorDisabledAt: new Date().toISOString()
    }, { merge: true });

    // Update custom claims
    await auth.setCustomUserClaims(userId, {
      ...decodedToken,
      twoFactorEnabled: false
    });

    logger.info('2FA successfully disabled', { userId });

    return NextResponse.json({
      message: 'Two-factor authentication has been disabled',
      disabled: true
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    logger.error('2FA disable failed:', error);
    return NextResponse.json(
      { error: 'Unable to disable two-factor authentication' },
      { status: 500 }
    );
  }
}