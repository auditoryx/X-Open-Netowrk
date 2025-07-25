/**
 * KYC Verification Service using Stripe Identity
 * 
 * This service handles document verification through Stripe Identity
 * for KYC compliance and user verification.
 */

import Stripe from 'stripe';
import { z } from 'zod';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Verification session schema
export const VerificationSessionSchema = z.object({
  id: z.string(),
  client_secret: z.string(),
  url: z.string(),
  status: z.enum(['requires_input', 'processing', 'verified', 'canceled']),
  metadata: z.record(z.string()),
});

export type VerificationSession = z.infer<typeof VerificationSessionSchema>;

// User verification data schema
export const UserVerificationSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  status: z.enum(['pending', 'processing', 'verified', 'rejected', 'canceled']),
  verifiedAt: z.date().optional(),
  rejectedAt: z.date().optional(),
  rejectionReason: z.string().optional(),
  documentType: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type UserVerification = z.infer<typeof UserVerificationSchema>;

/**
 * Start a new verification session for a user
 */
export async function startVerification(userId: string): Promise<VerificationSession> {
  try {
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { 
        userId,
        platform: 'auditoryx-on',
        timestamp: new Date().toISOString(),
      },
      options: {
        document: {
          // Allow most common ID types
          allowed_types: ['driving_license', 'passport', 'id_card'],
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/verification/pending`,
    });

    return {
      id: verificationSession.id,
      client_secret: verificationSession.client_secret!,
      url: verificationSession.url!,
      status: verificationSession.status,
      metadata: verificationSession.metadata || {},
    };
  } catch (error) {
    console.error('Error starting verification session:', error);
    throw new Error('Failed to start verification session');
  }
}

/**
 * Retrieve verification session status
 */
export async function getVerificationSession(sessionId: string): Promise<VerificationSession | null> {
  try {
    const session = await stripe.identity.verificationSessions.retrieve(sessionId);
    
    return {
      id: session.id,
      client_secret: session.client_secret!,
      url: session.url!,
      status: session.status,
      metadata: session.metadata || {},
    };
  } catch (error) {
    console.error('Error retrieving verification session:', error);
    return null;
  }
}

/**
 * Cancel a verification session
 */
export async function cancelVerification(sessionId: string): Promise<boolean> {
  try {
    await stripe.identity.verificationSessions.cancel(sessionId);
    return true;
  } catch (error) {
    console.error('Error canceling verification session:', error);
    return false;
  }
}

/**
 * Process verification webhook from Stripe
 */
export async function processVerificationWebhook(
  body: string, 
  signature: string
): Promise<UserVerification | null> {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_IDENTITY_WEBHOOK_SECRET!
    );

    if (event.type === 'identity.verification_session.verified' || 
        event.type === 'identity.verification_session.requires_input') {
      
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const userId = session.metadata?.userId;

      if (!userId) {
        console.error('No userId found in verification session metadata');
        return null;
      }

      const status = mapStripeStatusToInternal(session.status);
      
      return {
        userId,
        sessionId: session.id,
        status,
        verifiedAt: session.status === 'verified' ? new Date() : undefined,
        rejectedAt: session.status === 'requires_input' ? new Date() : undefined,
        rejectionReason: session.last_error?.reason || undefined,
        documentType: session.verified_outputs?.document?.type || undefined,
        createdAt: new Date(session.created * 1000),
        updatedAt: new Date(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error processing verification webhook:', error);
    return null;
  }
}

/**
 * Map Stripe verification status to internal status
 */
function mapStripeStatusToInternal(stripeStatus: string): UserVerification['status'] {
  switch (stripeStatus) {
    case 'verified':
      return 'verified';
    case 'processing':
      return 'processing';
    case 'requires_input':
      return 'rejected';
    case 'canceled':
      return 'canceled';
    default:
      return 'pending';
  }
}

/**
 * Validate verification requirements for user tier
 */
export function getVerificationRequirements(tier: string): {
  required: boolean;
  documentTypes: string[];
  additionalChecks: string[];
} {
  switch (tier) {
    case 'signature':
      return {
        required: true,
        documentTypes: ['passport', 'driving_license', 'id_card'],
        additionalChecks: ['selfie', 'address_verification'],
      };
    case 'verified':
      return {
        required: true,
        documentTypes: ['driving_license', 'id_card'],
        additionalChecks: ['selfie'],
      };
    default:
      return {
        required: false,
        documentTypes: [],
        additionalChecks: [],
      };
  }
}

/**
 * Check if user meets verification requirements for tier upgrade
 */
export async function canUpgradeToTier(
  userId: string, 
  targetTier: string, 
  currentVerificationStatus: string
): Promise<{ canUpgrade: boolean; reason?: string }> {
  const requirements = getVerificationRequirements(targetTier);
  
  if (!requirements.required) {
    return { canUpgrade: true };
  }

  if (currentVerificationStatus !== 'verified') {
    return { 
      canUpgrade: false, 
      reason: 'Identity verification required for this tier' 
    };
  }

  return { canUpgrade: true };
}

export default {
  startVerification,
  getVerificationSession,
  cancelVerification,
  processVerificationWebhook,
  getVerificationRequirements,
  canUpgradeToTier,
};