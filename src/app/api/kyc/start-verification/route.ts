/**
 * API endpoint to start KYC verification process
 * 
 * POST /api/kyc/start-verification
 * Initiates a new Stripe Identity verification session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { startVerification } from '@/lib/kyc/stripe-identity';
import { createVerificationRecord, canRetryVerification, incrementRetryCount } from '@/lib/kyc/verification-logic';
import { z } from 'zod';

// Request validation schema
const StartVerificationRequestSchema = z.object({
  reason: z.string().optional(),
  tier: z.enum(['verified', 'signature']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.uid;

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validatedData = StartVerificationRequestSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validatedData.error.errors },
        { status: 400 }
      );
    }

    const { reason, tier } = validatedData.data;

    // Check if user can retry verification
    const retryCheck = await canRetryVerification(userId);
    if (!retryCheck.canRetry) {
      return NextResponse.json(
        { 
          error: 'Cannot start verification',
          reason: retryCheck.reason,
          cooldownUntil: retryCheck.cooldownUntil?.toISOString(),
        },
        { status: 429 }
      );
    }

    // Start Stripe Identity verification session
    const verificationSession = await startVerification(userId);

    // Create verification record in Firestore
    await createVerificationRecord(
      userId,
      verificationSession.id,
      'pending'
    );

    // If this is a retry, increment retry count
    const lastVerification = await canRetryVerification(userId);
    if (lastVerification.canRetry && lastVerification.cooldownUntil) {
      await incrementRetryCount(userId, verificationSession.id);
    }

    // Return verification session details
    return NextResponse.json({
      success: true,
      verification: {
        sessionId: verificationSession.id,
        clientSecret: verificationSession.client_secret,
        url: verificationSession.url,
        status: verificationSession.status,
      },
      message: 'Verification session started successfully',
    });

  } catch (error) {
    console.error('Error starting verification:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to start verification process',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}