import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { authenticator } from 'otplib';
import { z } from 'zod';

const verifyLoginSchema = z.object({
  token: z.string().min(1, 'Token is required')
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
    const { token: totpToken } = verifyLoginSchema.parse(body);

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is not enabled for this account' },
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
    } else if (totpToken.length === 8 && /^[A-F0-9]+$/i.test(totpToken)) {
      // Backup code
      const upperToken = totpToken.toUpperCase();
      if (backupCodes.includes(upperToken)) {
        isValid = true;
        usedBackupCode = upperToken;
      }
    }

    if (!isValid) {
      logger.warn('Failed 2FA verification attempt', { userId });
      return NextResponse.json(
        { error: 'Invalid verification code or backup code' },
        { status: 400 }
      );
    }

    // Remove backup code if used
    if (usedBackupCode) {
      const remainingBackupCodes = backupCodes.filter((code: string) => code !== usedBackupCode);
      await db.collection('users').doc(userId).set({
        twoFactorBackupCodes: remainingBackupCodes
      }, { merge: true });

      logger.info('Backup code used for 2FA verification', { 
        userId, 
        remainingCodes: remainingBackupCodes.length 
      });
    } else {
      logger.info('TOTP code verified for login', { userId });
    }

    // Update custom claims to indicate successful 2FA verification
    const customClaims = decodedToken.customClaims || {};
    await auth.setCustomUserClaims(userId, {
      ...customClaims,
      twoFactorVerified: true,
      twoFactorVerifiedAt: Math.floor(Date.now() / 1000)
    });

    return NextResponse.json({
      message: 'Two-factor authentication verified successfully',
      verified: true,
      usedBackupCode: !!usedBackupCode,
      backupCodesRemaining: usedBackupCode ? backupCodes.length - 1 : backupCodes.length
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    logger.error('2FA login verification failed:', error);
    return NextResponse.json(
      { error: 'Unable to verify two-factor authentication' },
      { status: 500 }
    );
  }
}