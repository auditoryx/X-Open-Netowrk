import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { verifyTwoFactorToken, twoFactorRateLimiter } from '@/lib/auth/twoFactor';
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

    // Check rate limiting
    if (twoFactorRateLimiter.isRateLimited(userId)) {
      const resetTime = twoFactorRateLimiter.getResetTime(userId);
      logger.warn('2FA login verification rate limited', { userId, resetTime });
      return NextResponse.json(
        { 
          error: 'Too many failed attempts. Please try again later.',
          resetTime: Math.ceil(resetTime / 1000 / 60) // minutes
        },
        { status: 429 }
      );
    }

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

    // Verify token using utility
    const verificationResult = verifyTwoFactorToken(totpToken, secret, backupCodes);

    if (!verificationResult.isValid) {
      twoFactorRateLimiter.recordFailedAttempt(userId);
      logger.warn('Failed 2FA login verification attempt', { userId });
      return NextResponse.json(
        { error: 'Invalid verification code or backup code' },
        { status: 400 }
      );
    }

    // Reset rate limiting on successful verification
    twoFactorRateLimiter.resetAttempts(userId);

    // Remove backup code if used
    if (verificationResult.usedBackupCode) {
      const remainingBackupCodes = backupCodes.filter((code: string) => code !== verificationResult.usedBackupCode);
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
      usedBackupCode: !!verificationResult.usedBackupCode,
      backupCodesRemaining: verificationResult.usedBackupCode ? 
        verificationResult.remainingBackupCodes : backupCodes.length
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