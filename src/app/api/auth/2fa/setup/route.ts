import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { z } from 'zod';

const setupTwoFASchema = z.object({
  userId: z.string().min(1, 'User ID is required')
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
    const userRecord = await auth.getUser(userId);

    // Check if 2FA is already enabled
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (userData?.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is already enabled' },
        { status: 400 }
      );
    }

    // Generate secret for TOTP
    const secret = authenticator.generateSecret();
    const serviceName = 'X-Open-Network';
    const accountName = userRecord.email || userId;

    // Create the TOTP URL for QR code
    const otpUrl = authenticator.keyuri(accountName, serviceName, secret);

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(otpUrl);

    // Store the secret temporarily (not yet enabled)
    await db.collection('users').doc(userId).set({
      twoFactorSecret: secret,
      twoFactorEnabled: false,
      twoFactorSetupInProgress: true
    }, { merge: true });

    logger.info('2FA setup initiated', { userId, email: userRecord.email });

    return NextResponse.json({
      secret,
      qrCode: qrCodeDataURL,
      backupCodes: [], // We'll generate these when 2FA is confirmed
      message: 'Two-factor authentication setup initiated. Scan the QR code with your authenticator app.'
    });

  } catch (error) {
    logger.error('2FA setup failed:', error);
    return NextResponse.json(
      { error: 'Unable to setup two-factor authentication' },
      { status: 500 }
    );
  }
}