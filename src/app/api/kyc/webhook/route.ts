/**
 * Stripe Identity Webhook Handler
 * 
 * POST /api/kyc/webhook
 * Handles webhook events from Stripe Identity verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { processVerificationWebhook } from '@/lib/kyc/stripe-identity';
import { updateVerificationRecord } from '@/lib/kyc/verification-logic';

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const headersList = headers();
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      );
    }

    // Get request body as text for signature verification
    const body = await request.text();

    // Process the webhook event
    const verification = await processVerificationWebhook(body, signature);

    if (!verification) {
      // Not a verification event we care about, or invalid
      return NextResponse.json({ received: true });
    }

    // Update verification record in Firestore
    await updateVerificationRecord(
      verification.userId,
      verification.sessionId,
      {
        status: verification.status,
        verifiedAt: verification.verifiedAt,
        rejectedAt: verification.rejectedAt,
        rejectionReason: verification.rejectionReason,
        documentType: verification.documentType,
        updatedAt: new Date(),
      }
    );

    // Log successful processing
    console.log(`Processed verification webhook for user ${verification.userId}, status: ${verification.status}`);

    // Send notification to user (email, push, etc.)
    await sendVerificationStatusNotification(verification);

    return NextResponse.json({ 
      received: true,
      processed: true,
      userId: verification.userId,
      status: verification.status,
    });

  } catch (error) {
    console.error('Error processing verification webhook:', error);
    
    // Return 500 to make Stripe retry
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Send notification to user about verification status change
 */
async function sendVerificationStatusNotification(verification: any) {
  try {
    // In production, implement email/push notifications here
    // For example:
    // - SendGrid email
    // - Firebase Cloud Messaging
    // - In-app notifications
    
    console.log(`Notification: User ${verification.userId} verification status changed to ${verification.status}`);
    
    // Example email notification structure:
    const notificationData = {
      userId: verification.userId,
      type: 'verification_status_update',
      status: verification.status,
      timestamp: new Date().toISOString(),
      message: getStatusMessage(verification.status),
    };

    // TODO: Implement actual notification service
    console.log('Notification data:', notificationData);
    
  } catch (error) {
    console.error('Error sending verification notification:', error);
    // Don't throw - webhook should still succeed even if notification fails
  }
}

/**
 * Get user-friendly status message
 */
function getStatusMessage(status: string): string {
  switch (status) {
    case 'verified':
      return 'Your identity verification has been approved! You can now access verified features.';
    case 'rejected':
      return 'Your identity verification was not approved. Please try again with clearer documents.';
    case 'processing':
      return 'Your verification documents are being reviewed. This usually takes 1-2 business days.';
    case 'canceled':
      return 'Your verification session was canceled. You can start a new verification anytime.';
    default:
      return 'Your verification status has been updated.';
  }
}

// Only allow POST requests
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