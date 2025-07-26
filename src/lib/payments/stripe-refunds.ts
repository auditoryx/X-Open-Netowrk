/**
 * Stripe Refund Integration
 * 
 * Handles actual refund processing through Stripe
 */

import { stripe } from '@/lib/stripe';
import { RefundCalculation } from './refund-calculator';

export interface StripeRefundResult {
  refundId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  reason: 'requested_by_customer' | 'duplicate' | 'fraudulent';
  failureReason?: string;
  receiptNumber?: string;
  refundedAt?: Date;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount: number; // Amount in dollars
  reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent';
  metadata?: Record<string, string>;
}

/**
 * Process refund through Stripe
 */
export async function processStripeRefund(
  refundRequest: RefundRequest,
  calculation: RefundCalculation
): Promise<StripeRefundResult> {
  try {
    // Convert amount to cents
    const amountInCents = Math.round(calculation.refundAmount * 100);
    
    if (amountInCents <= 0) {
      throw new Error('Refund amount must be greater than $0');
    }

    // Create refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: refundRequest.paymentIntentId,
      amount: amountInCents,
      reason: refundRequest.reason || 'requested_by_customer',
      metadata: {
        ...refundRequest.metadata,
        original_amount: calculation.originalAmount.toString(),
        refund_percentage: calculation.refundPercentage.toString(),
        processing_fee: calculation.processingFee.toString(),
        cancellation_reason: calculation.cancellationReason || 'user_requested',
        hours_until_booking: Math.round(calculation.timeUntilBooking).toString()
      }
    });

    return {
      refundId: refund.id,
      amount: refund.amount / 100, // Convert back to dollars
      currency: refund.currency,
      status: refund.status as any,
      reason: refund.reason as any,
      failureReason: refund.failure_reason || undefined,
      receiptNumber: refund.receipt_number || undefined,
      refundedAt: refund.created ? new Date(refund.created * 1000) : undefined
    };

  } catch (error: any) {
    console.error('Stripe refund failed:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      throw new Error(`Refund failed: ${error.message}`);
    } else if (error.type === 'StripeInvalidRequestError') {
      throw new Error(`Invalid refund request: ${error.message}`);
    } else if (error.type === 'StripeAPIError') {
      throw new Error('Payment service temporarily unavailable. Please try again.');
    } else {
      throw new Error('Refund processing failed. Please contact support.');
    }
  }
}

/**
 * Get refund status from Stripe
 */
export async function getRefundStatus(refundId: string): Promise<StripeRefundResult | null> {
  try {
    const refund = await stripe.refunds.retrieve(refundId);
    
    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      currency: refund.currency,
      status: refund.status as any,
      reason: refund.reason as any,
      failureReason: refund.failure_reason || undefined,
      receiptNumber: refund.receipt_number || undefined,
      refundedAt: refund.created ? new Date(refund.created * 1000) : undefined
    };
  } catch (error: any) {
    console.error('Failed to retrieve refund status:', error);
    return null;
  }
}

/**
 * List refunds for a payment intent
 */
export async function listRefundsForPayment(paymentIntentId: string): Promise<StripeRefundResult[]> {
  try {
    const refunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 10
    });

    return refunds.data.map(refund => ({
      refundId: refund.id,
      amount: refund.amount / 100,
      currency: refund.currency,
      status: refund.status as any,
      reason: refund.reason as any,
      failureReason: refund.failure_reason || undefined,
      receiptNumber: refund.receipt_number || undefined,
      refundedAt: refund.created ? new Date(refund.created * 1000) : undefined
    }));
  } catch (error: any) {
    console.error('Failed to list refunds:', error);
    return [];
  }
}

/**
 * Calculate maximum refundable amount for a payment intent
 */
export async function getMaxRefundableAmount(paymentIntentId: string): Promise<number> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return 0;
    }

    // Get existing refunds
    const existingRefunds = await listRefundsForPayment(paymentIntentId);
    const totalRefunded = existingRefunds
      .filter(r => r.status === 'succeeded')
      .reduce((sum, r) => sum + r.amount, 0);

    const originalAmount = paymentIntent.amount / 100;
    return Math.max(0, originalAmount - totalRefunded);
  } catch (error: any) {
    console.error('Failed to calculate max refundable amount:', error);
    return 0;
  }
}

/**
 * Validate refund is possible
 */
export async function validateRefundRequest(
  paymentIntentId: string,
  requestedAmount: number
): Promise<{ valid: boolean; error?: string; maxAmount?: number }> {
  try {
    const maxRefundable = await getMaxRefundableAmount(paymentIntentId);
    
    if (requestedAmount > maxRefundable) {
      return {
        valid: false,
        error: `Requested amount ($${requestedAmount.toFixed(2)}) exceeds maximum refundable amount ($${maxRefundable.toFixed(2)})`,
        maxAmount: maxRefundable
      };
    }
    
    if (requestedAmount <= 0) {
      return {
        valid: false,
        error: 'Refund amount must be greater than $0'
      };
    }

    return { valid: true, maxAmount: maxRefundable };
  } catch (error: any) {
    return {
      valid: false,
      error: 'Unable to validate refund request'
    };
  }
}

export default {
  processStripeRefund,
  getRefundStatus,
  listRefundsForPayment,
  getMaxRefundableAmount,
  validateRefundRequest
};