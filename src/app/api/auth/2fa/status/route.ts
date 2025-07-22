import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';

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

    const backupCodes = userData?.twoFactorBackupCodes || [];
    const backupCodesRemaining = backupCodes.length;

    return NextResponse.json({
      twoFactorEnabled: userData?.twoFactorEnabled || false,
      setupInProgress: userData?.twoFactorSetupInProgress || false,
      enabledAt: userData?.twoFactorEnabledAt || null,
      backupCodesRemaining,
      hasBackupCodes: backupCodesRemaining > 0
    });

  } catch (error) {
    logger.error('2FA status check failed:', error);
    return NextResponse.json(
      { error: 'Unable to check two-factor authentication status' },
      { status: 500 }
    );
  }
}