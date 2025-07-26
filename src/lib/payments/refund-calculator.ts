/**
 * AuditoryX Cancellation & Refund Logic
 * 
 * Implements time-based refund policies for booking cancellations
 */

export interface CancellationPolicy {
  hoursBeforeBooking: number;
  refundPercentage: number;
  description: string;
}

export interface RefundCalculation {
  originalAmount: number;
  refundAmount: number;
  refundPercentage: number;
  platformFeeRefund: number;
  processingFee: number;
  timeUntilBooking: number;
  policyApplied: CancellationPolicy;
  cancellationReason?: string;
}

export interface BookingForCancellation {
  id: string;
  amount: number;
  currency: string;
  scheduledDateTime: Date;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  paymentIntentId?: string;
  createdAt: Date;
}

// Standard cancellation policies
export const CANCELLATION_POLICIES: CancellationPolicy[] = [
  {
    hoursBeforeBooking: 72, // 3 days
    refundPercentage: 100,
    description: "Full refund for cancellations 72+ hours before booking"
  },
  {
    hoursBeforeBooking: 48, // 2 days
    refundPercentage: 75,
    description: "75% refund for cancellations 48-72 hours before booking"
  },
  {
    hoursBeforeBooking: 24, // 1 day
    refundPercentage: 50,
    description: "50% refund for cancellations 24-48 hours before booking"
  },
  {
    hoursBeforeBooking: 2, // 2 hours
    refundPercentage: 25,
    description: "25% refund for cancellations 2-24 hours before booking"
  },
  {
    hoursBeforeBooking: 0, // Last minute
    refundPercentage: 0,
    description: "No refund for cancellations less than 2 hours before booking"
  }
];

/**
 * Calculate refund amount based on cancellation timing
 */
export function calculateRefund(
  booking: BookingForCancellation,
  cancellationTime: Date = new Date(),
  cancellationReason?: string
): RefundCalculation {
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    throw new Error(`Cannot cancel booking with status: ${booking.status}`);
  }

  // Calculate time until booking
  const timeUntilBookingMs = booking.scheduledDateTime.getTime() - cancellationTime.getTime();
  const hoursUntilBooking = timeUntilBookingMs / (1000 * 60 * 60);

  // Handle past bookings
  if (hoursUntilBooking < 0) {
    throw new Error('Cannot cancel past bookings');
  }

  // Find applicable policy
  const applicablePolicy = CANCELLATION_POLICIES.find(policy => 
    hoursUntilBooking >= policy.hoursBeforeBooking
  ) || CANCELLATION_POLICIES[CANCELLATION_POLICIES.length - 1]; // Default to most restrictive

  // Calculate refund amounts
  const refundPercentage = applicablePolicy.refundPercentage;
  const refundAmount = Math.round((booking.amount * refundPercentage / 100) * 100) / 100;
  
  // Platform fee refund (20% of original amount, refunded proportionally)
  const originalPlatformFee = Math.round(booking.amount * 0.20 * 100) / 100;
  const platformFeeRefund = Math.round((originalPlatformFee * refundPercentage / 100) * 100) / 100;
  
  // Processing fee (3% of refund amount, capped at $5)
  const processingFee = Math.min(Math.round(refundAmount * 0.03 * 100) / 100, 5.00);

  return {
    originalAmount: booking.amount,
    refundAmount,
    refundPercentage,
    platformFeeRefund,
    processingFee,
    timeUntilBooking: hoursUntilBooking,
    policyApplied: applicablePolicy,
    cancellationReason
  };
}

/**
 * Get cancellation policy description for given time
 */
export function getCancellationPolicyDescription(hoursUntilBooking: number): string {
  const policy = CANCELLATION_POLICIES.find(p => hoursUntilBooking >= p.hoursBeforeBooking) 
    || CANCELLATION_POLICIES[CANCELLATION_POLICIES.length - 1];
  
  return policy.description;
}

/**
 * Validate if booking can be cancelled
 */
export function canCancelBooking(booking: BookingForCancellation): { canCancel: boolean; reason?: string } {
  if (booking.status === 'cancelled') {
    return { canCancel: false, reason: 'Booking is already cancelled' };
  }
  
  if (booking.status === 'completed') {
    return { canCancel: false, reason: 'Cannot cancel completed booking' };
  }
  
  const now = new Date();
  if (booking.scheduledDateTime.getTime() <= now.getTime()) {
    return { canCancel: false, reason: 'Cannot cancel past bookings' };
  }
  
  return { canCancel: true };
}

/**
 * Format refund calculation for display
 */
export function formatRefundSummary(calculation: RefundCalculation): {
  summary: string;
  details: string[];
  netRefund: number;
} {
  const netRefund = Math.max(0, calculation.refundAmount - calculation.processingFee);
  
  return {
    summary: `${calculation.refundPercentage}% refund - $${netRefund.toFixed(2)} will be returned`,
    details: [
      `Original amount: $${calculation.originalAmount.toFixed(2)}`,
      `Refund percentage: ${calculation.refundPercentage}%`,
      `Gross refund: $${calculation.refundAmount.toFixed(2)}`,
      calculation.processingFee > 0 ? `Processing fee: $${calculation.processingFee.toFixed(2)}` : null,
      `Net refund: $${netRefund.toFixed(2)}`,
      `Time until booking: ${Math.round(calculation.timeUntilBooking)} hours`,
      `Policy: ${calculation.policyApplied.description}`
    ].filter(Boolean) as string[],
    netRefund
  };
}

export default {
  calculateRefund,
  getCancellationPolicyDescription,
  canCancelBooking,
  formatRefundSummary,
  CANCELLATION_POLICIES
};