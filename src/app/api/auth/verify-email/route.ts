import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  oobCode: z.string().min(1, 'Verification code is required')
});

export async function POST(req: NextRequest) {
  try {
    if (!admin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { oobCode } = verifyEmailSchema.parse(body);

    const auth = getAuth(admin);

    // Verify the email with the code
    await auth.applyActionCode(oobCode);

    logger.info('Email verification completed successfully');

    return NextResponse.json({ 
      message: 'Email verified successfully! You can now access all features.',
      verified: true
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Handle Firebase specific errors
    if (error?.code === 'auth/expired-action-code') {
      return NextResponse.json(
        { error: 'Email verification link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (error?.code === 'auth/invalid-action-code') {
      return NextResponse.json(
        { error: 'Invalid verification link. Please request a new one.' },
        { status: 400 }
      );
    }

    logger.error('Email verification failed:', error);
    return NextResponse.json(
      { error: 'Unable to verify email. Please try again or request a new verification link.' },
      { status: 500 }
    );
  }
}

// GET endpoint to check verification code validity
export async function GET(req: NextRequest) {
  try {
    if (!admin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const oobCode = searchParams.get('oobCode');

    if (!oobCode) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    const auth = getAuth(admin);

    // Check the action code to get info about it
    const actionCodeInfo = await auth.checkActionCode(oobCode);

    return NextResponse.json({ 
      valid: true,
      email: actionCodeInfo.data?.email || '',
      message: 'Verification code is valid' 
    });

  } catch (error: any) {
    if (error?.code === 'auth/expired-action-code') {
      return NextResponse.json(
        { valid: false, error: 'Email verification link has expired' },
        { status: 400 }
      );
    }

    if (error?.code === 'auth/invalid-action-code') {
      return NextResponse.json(
        { valid: false, error: 'Invalid email verification link' },
        { status: 400 }
      );
    }

    logger.error('Verification code check failed:', error);
    return NextResponse.json(
      { valid: false, error: 'Unable to verify code' },
      { status: 500 }
    );
  }
}