import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { sendEmailVerificationEmail } from '@/lib/email/sendEmailVerificationEmail';
import { z } from 'zod';

const sendVerificationSchema = z.object({
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
    const { email } = sendVerificationSchema.parse(body);

    const auth = getAuth(admin);

    // Check if user exists
    const userRecord = await auth.getUserByEmail(email).catch(() => null);
    
    if (!userRecord) {
      // Don't reveal if email exists for security
      return NextResponse.json({ 
        message: 'If an account exists with that email, a verification link has been sent.'
      });
    }

    // Check if already verified
    if (userRecord.emailVerified) {
      return NextResponse.json({ 
        message: 'Email address is already verified.',
        alreadyVerified: true
      });
    }

    // Generate email verification link
    const verificationLink = await auth.generateEmailVerificationLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email`,
      handleCodeInApp: false
    });

    // Send verification email
    try {
      await sendEmailVerificationEmail(email, verificationLink, userRecord.displayName || 'User');
      logger.info('Email verification sent successfully', { 
        email: email.replace(/@.*/, '@***'),
        uid: userRecord.uid 
      });
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      // Don't fail the request if email sending fails
    }

    return NextResponse.json({ 
      message: 'If an account exists with that email, a verification link has been sent.'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    logger.error('Email verification request failed:', error);
    return NextResponse.json(
      { error: 'Unable to send verification email' },
      { status: 500 }
    );
  }
}