import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  oobCode: z.string().min(1, 'Reset code is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain at least one uppercase, lowercase, number, and special character')
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
    const { oobCode, newPassword } = resetPasswordSchema.parse(body);

    const auth = getAuth(admin);

    // Verify the reset code and reset password
    await auth.confirmPasswordReset(oobCode, newPassword);

    logger.info('Password reset completed successfully');

    return NextResponse.json({ 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
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
        { error: 'Password reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (error?.code === 'auth/invalid-action-code') {
      return NextResponse.json(
        { error: 'Invalid or already used password reset link.' },
        { status: 400 }
      );
    }

    logger.error('Password reset confirmation failed:', error);
    return NextResponse.json(
      { error: 'Unable to reset password. Please try again or request a new reset link.' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify reset code
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
        { error: 'Reset code is required' },
        { status: 400 }
      );
    }

    const auth = getAuth(admin);

    // Verify the reset code without actually resetting
    await auth.checkActionCode(oobCode);

    return NextResponse.json({ 
      valid: true,
      message: 'Reset code is valid' 
    });

  } catch (error: any) {
    if (error?.code === 'auth/expired-action-code') {
      return NextResponse.json(
        { valid: false, error: 'Password reset link has expired' },
        { status: 400 }
      );
    }

    if (error?.code === 'auth/invalid-action-code') {
      return NextResponse.json(
        { valid: false, error: 'Invalid password reset link' },
        { status: 400 }
      );
    }

    logger.error('Reset code verification failed:', error);
    return NextResponse.json(
      { valid: false, error: 'Unable to verify reset code' },
      { status: 500 }
    );
  }
}