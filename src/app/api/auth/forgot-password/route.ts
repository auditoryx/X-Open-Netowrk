import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
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
    const { email } = forgotPasswordSchema.parse(body);

    const auth = getAuth(admin);

    // Check if user exists first
    const userRecord = await auth.getUserByEmail(email).catch(() => null);
    
    if (!userRecord) {
      // Don't reveal if email exists for security
      return NextResponse.json({ 
        message: 'If an account with that email exists, you will receive a password reset link.' 
      });
    }

    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      handleCodeInApp: false
    });

    // For now, we'll return the link directly
    // In production, you'd want to send this via email
    logger.info('Password reset link generated', { email: email.replace(/@.*/, '@***') });

    return NextResponse.json({ 
      message: 'If an account with that email exists, you will receive a password reset link.',
      // TODO: Remove this in production and send via email instead
      resetLink: resetLink
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    logger.error('Password reset request failed:', error);
    return NextResponse.json(
      { error: 'Unable to process password reset request' },
      { status: 500 }
    );
  }
}