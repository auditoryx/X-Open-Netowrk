/**
 * AuditoryX Cancellation & Refund Calculator
 * 
 * Implements time-based refund policies for bookings
 * based on platform terms and creator tier
 */

import { z } from 'zod';

export const CancellationPolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  rules: z.array(z.object({
    hoursBeforeBooking: z.number().min(0),
    refundPercentage: z.number().min(0).max(100),
    description: z.string()
  }))
});

export type CancellationPolicy = z.infer<typeof CancellationPolicySchema>;

export const BookingDataSchema = z.object({
  id: z.string(),
  scheduledTime: z.string(), // ISO datetime string
  amount: z.number().min(0),
  currency: z.string().default('usd'),
  providerId: z.string(),
  clientId: z.string(),
  creatorTier: z.enum(['standard', 'verified', 'signature']).optional(),
  customPolicy: z.string().optional() // Custom policy ID override
});

export type BookingData = z.infer<typeof BookingDataSchema>;

export interface RefundCalculation {
  refundAmount: number;
  platformFee: number;
  processingFee: number;
  refundPercentage: number;
  hoursUntilBooking: number;
  appliedRule: string;
  canCancel: boolean;
  reason: string;
}

// Default cancellation policies by creator tier
export const DEFAULT_POLICIES: Record<string, CancellationPolicy> = {
  standard: {
    id: 'standard',
    name: 'Standard Policy',
    description: 'Basic cancellation policy for standard tier creators',
    rules: [
      {
        hoursBeforeBooking: 48,
        refundPercentage: 100,
        description: 'Full refund if cancelled 48+ hours before booking'
      },
      {
        hoursBeforeBooking: 24,
        refundPercentage: 50,
        description: '50% refund if cancelled 24-48 hours before booking'
      },
      {
        hoursBeforeBooking: 0,
        refundPercentage: 0,
        description: 'No refund if cancelled less than 24 hours before booking'
      }
    ]
  },
  verified: {
    id: 'verified',
    name: 'Verified Creator Policy',
    description: 'Enhanced cancellation policy for verified creators',
    rules: [
      {
        hoursBeforeBooking: 72,
        refundPercentage: 100,
        description: 'Full refund if cancelled 72+ hours before booking'
      },
      {
        hoursBeforeBooking: 48,
        refundPercentage: 75,
        description: '75% refund if cancelled 48-72 hours before booking'
      },
      {
        hoursBeforeBooking: 24,
        refundPercentage: 25,
        description: '25% refund if cancelled 24-48 hours before booking'
      },
      {
        hoursBeforeBooking: 0,
        refundPercentage: 0,
        description: 'No refund if cancelled less than 24 hours before booking'
      }
    ]
  },
  signature: {
    id: 'signature',
    name: 'Signature Creator Policy',
    description: 'Premium cancellation policy for signature creators',
    rules: [
      {
        hoursBeforeBooking: 168, // 7 days
        refundPercentage: 100,
        description: 'Full refund if cancelled 7+ days before booking'
      },
      {
        hoursBeforeBooking: 72,
        refundPercentage: 75,
        description: '75% refund if cancelled 3-7 days before booking'
      },
      {
        hoursBeforeBooking: 48,
        refundPercentage: 50,
        description: '50% refund if cancelled 2-3 days before booking'
      },
      {
        hoursBeforeBooking: 24,
        refundPercentage: 10,
        description: '10% refund if cancelled 1-2 days before booking'
      },
      {
        hoursBeforeBooking: 0,
        refundPercentage: 0,
        description: 'No refund if cancelled less than 24 hours before booking'
      }
    ]
  }
};

/**
 * Calculate refund amount based on cancellation timing and policy
 */
export function calculateRefund(
  booking: BookingData,
  cancellationTime: Date = new Date(),
  customPolicy?: CancellationPolicy
): RefundCalculation {
  // Validate input
  const validBooking = BookingDataSchema.parse(booking);
  
  const scheduledTime = new Date(validBooking.scheduledTime);
  const timeUntilBooking = scheduledTime.getTime() - cancellationTime.getTime();
  const hoursUntilBooking = timeUntilBooking / (1000 * 60 * 60);

  // Get applicable policy
  const policy = customPolicy || 
                 DEFAULT_POLICIES[validBooking.creatorTier || 'standard'] ||
                 DEFAULT_POLICIES.standard;

  // Find applicable rule (rules should be sorted by hoursBeforeBooking desc)
  const applicableRule = policy.rules
    .sort((a, b) => b.hoursBeforeBooking - a.hoursBeforeBooking)
    .find(rule => hoursUntilBooking >= rule.hoursBeforeBooking) ||
    policy.rules[policy.rules.length - 1]; // Default to most restrictive rule

  // Calculate refund amounts
  const refundPercentage = applicableRule.refundPercentage;
  const baseRefundAmount = (validBooking.amount * refundPercentage) / 100;
  
  // Platform processing fee (2.9% + $0.30 - industry standard)
  const processingFee = refundPercentage > 0 ? Math.min(
    validBooking.amount * 0.029 + 0.30,
    baseRefundAmount * 0.1 // Cap processing fee at 10% of refund
  ) : 0;
  
  // Platform keeps 20% fee if service was booked
  const platformFee = refundPercentage < 100 ? validBooking.amount * 0.20 : 0;
  
  const refundAmount = Math.max(0, baseRefundAmount - processingFee);
  
  // Determine if cancellation is allowed
  const canCancel = hoursUntilBooking >= 0; // Can't cancel past bookings
  const reason = !canCancel 
    ? 'Cannot cancel bookings that have already occurred'
    : refundPercentage === 0 
    ? 'Cancellation too close to booking time - no refund available'
    : `${refundPercentage}% refund applied based on ${policy.name}`;

  return {
    refundAmount: Math.round(refundAmount * 100) / 100, // Round to 2 decimal places
    platformFee: Math.round(platformFee * 100) / 100,
    processingFee: Math.round(processingFee * 100) / 100,
    refundPercentage,
    hoursUntilBooking: Math.max(0, hoursUntilBooking),
    appliedRule: applicableRule.description,
    canCancel,
    reason
  };
}

/**
 * Get cancellation policy for a creator tier
 */
export function getCancellationPolicy(tier: string = 'standard'): CancellationPolicy {
  return DEFAULT_POLICIES[tier] || DEFAULT_POLICIES.standard;
}

/**
 * Check if a booking can be cancelled at the current time
 */
export function canCancelBooking(
  booking: BookingData,
  cancellationTime: Date = new Date()
): boolean {
  const calculation = calculateRefund(booking, cancellationTime);
  return calculation.canCancel;
}

/**
 * Get a human-readable cancellation policy summary
 */
export function getPolicySummary(tier: string = 'standard'): string {
  const policy = getCancellationPolicy(tier);
  return policy.rules
    .map(rule => {
      if (rule.hoursBeforeBooking === 0) {
        return `• Less than ${policy.rules[policy.rules.indexOf(rule) - 1]?.hoursBeforeBooking || 24} hours: ${rule.refundPercentage}% refund`;
      }
      return `• ${rule.hoursBeforeBooking}+ hours before: ${rule.refundPercentage}% refund`;
    })
    .join('\n');
}