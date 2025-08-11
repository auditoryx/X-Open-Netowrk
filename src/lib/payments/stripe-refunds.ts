/**
 * AuditoryX Stripe Refund Integration
 * 
 * Handles Stripe refund processing for cancelled bookings
 */

import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { EscrowService, EscrowPayment } from '../stripe/escrow';
import { calculateRefund, BookingData } from './refund-calculator';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface RefundResult {
  success: boolean;
  refundId?: string;
  refundAmount: number;
  processingFee: number;
  message: string;
  escrowStatus?: string;
}

export interface RefundRequest {
  bookingId: string;
  userId: string; // User requesting the refund
  reason?: string;
  isEmergency?: boolean; // Override normal policy for emergencies
}

export class StripeRefundService {
  private escrowService: EscrowService;

  constructor() {
    this.escrowService = new EscrowService();
  }

  /**
   * Process a refund for a cancelled booking
   */
  async processRefund(request: RefundRequest): Promise<RefundResult> {
    try {
      // Get booking details
      const bookingDoc = await adminDb.doc(`bookings/${request.bookingId}`).get();
      if (!bookingDoc.exists) {
        return {
          success: false,
          refundAmount: 0,
          processingFee: 0,
          message: 'Booking not found'
        };
      }

      const booking = bookingDoc.data();
      
      // Check if user is authorized to cancel this booking
      if (booking.clientId !== request.userId && booking.providerId !== request.userId) {
        return {
          success: false,
          refundAmount: 0,
          processingFee: 0,
          message: 'Unauthorized: You can only cancel your own bookings'
        };
      }

      // Check if booking is already cancelled
      if (booking.status === 'cancelled') {
        return {
          success: false,
          refundAmount: 0,
          processingFee: 0,
          message: 'Booking is already cancelled'
        };
      }

      // Get escrow payment details
      const escrow = await this.escrowService.getEscrowStatus(request.bookingId);
      if (!escrow) {
        return {
          success: false,
          refundAmount: 0,
          processingFee: 0,
          message: 'No payment found for this booking'
        };
      }

      // Check if payment is already refunded
      if (escrow.status === 'refunded') {
        return {
          success: false,
          refundAmount: 0,
          processingFee: 0,
          message: 'Payment has already been refunded'
        };
      }

      // Calculate refund amount
      const bookingData: BookingData = {
        id: request.bookingId,
        scheduledTime: booking.datetime || booking.scheduledTime,
        amount: escrow.amount,
        currency: escrow.currency,
        providerId: booking.providerId,
        clientId: booking.clientId,
        creatorTier: booking.creatorTier || 'standard'
      };

      const refundCalculation = calculateRefund(bookingData);

      // Check if cancellation is allowed
      if (!refundCalculation.canCancel && !request.isEmergency) {
        return {
          success: false,
          refundAmount: 0,
          processingFee: 0,
          message: refundCalculation.reason,
          escrowStatus: escrow.status
        };
      }

      // Handle emergency cancellations (admin override)
      let actualRefundAmount = refundCalculation.refundAmount;
      if (request.isEmergency) {
        actualRefundAmount = escrow.amount; // Full refund for emergencies
      }

      // Process refund based on escrow status
      let refund: Stripe.Refund;
      
      if (escrow.status === 'pending') {
        // Payment hasn't been captured yet - cancel the payment intent
        await stripe.paymentIntents.cancel(escrow.paymentIntentId);
        
        // Mark as refunded without creating a Stripe refund
        await this.updateBookingAndEscrow(
          request.bookingId,
          escrow,
          'cancelled',
          actualRefundAmount,
          request.reason
        );

        return {
          success: true,
          refundAmount: actualRefundAmount,
          processingFee: 0,
          message: 'Booking cancelled successfully (payment not yet captured)',
          escrowStatus: 'cancelled'
        };

      } else if (escrow.status === 'held' || escrow.status === 'released') {
        // Payment has been captured - create a refund
        const refundAmount = Math.round(actualRefundAmount * 100); // Convert to cents
        
        refund = await stripe.refunds.create({
          payment_intent: escrow.paymentIntentId,
          amount: refundAmount,
          reason: 'requested_by_customer',
          metadata: {
            bookingId: request.bookingId,
            userId: request.userId,
            reason: request.reason || 'Booking cancelled',
            isEmergency: request.isEmergency ? 'true' : 'false',
            originalAmount: escrow.amount.toString(),
            refundPercentage: refundCalculation.refundPercentage.toString()
          }
        });

        // Update booking and escrow records
        await this.updateBookingAndEscrow(
          request.bookingId,
          escrow,
          refund.id,
          actualRefundAmount,
          request.reason
        );

        return {
          success: true,
          refundId: refund.id,
          refundAmount: actualRefundAmount,
          processingFee: refundCalculation.processingFee,
          message: `Refund processed successfully. ${refundCalculation.refundPercentage}% refund applied.`,
          escrowStatus: escrow.status
        };

      } else {
        return {
          success: false,
          refundAmount: 0,
          processingFee: 0,
          message: `Cannot refund payment with status: ${escrow.status}`,
          escrowStatus: escrow.status
        };
      }

    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        refundAmount: 0,
        processingFee: 0,
        message: `Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get refund preview without processing
   */
  async getRefundPreview(bookingId: string): Promise<{
    canRefund: boolean;
    refundAmount: number;
    processingFee: number;
    refundPercentage: number;
    reason: string;
    hoursUntilBooking: number;
  }> {
    try {
      const bookingDoc = await adminDb.doc(`bookings/${bookingId}`).get();
      if (!bookingDoc.exists) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data();
      const escrow = await this.escrowService.getEscrowStatus(bookingId);
      
      if (!escrow) {
        throw new Error('No payment found for this booking');
      }

      const bookingData: BookingData = {
        id: bookingId,
        scheduledTime: booking.datetime || booking.scheduledTime,
        amount: escrow.amount,
        currency: escrow.currency,
        providerId: booking.providerId,
        clientId: booking.clientId,
        creatorTier: booking.creatorTier || 'standard'
      };

      const calculation = calculateRefund(bookingData);

      return {
        canRefund: calculation.canCancel && escrow.status !== 'refunded',
        refundAmount: calculation.refundAmount,
        processingFee: calculation.processingFee,
        refundPercentage: calculation.refundPercentage,
        reason: calculation.reason,
        hoursUntilBooking: calculation.hoursUntilBooking
      };

    } catch (error) {
      console.error('Error getting refund preview:', error);
      throw error;
    }
  }

  /**
   * Update booking and escrow records after refund
   */
  private async updateBookingAndEscrow(
    bookingId: string,
    escrow: EscrowPayment,
    refundId: string,
    refundAmount: number,
    reason?: string
  ): Promise<void> {
    const timestamp = new Date().toISOString();

    // Update booking status
    await adminDb.doc(`bookings/${bookingId}`).update({
      status: 'cancelled',
      paymentStatus: 'refunded',
      refundedAt: timestamp,
      refundAmount,
      refundReason: reason,
      refundId,
      updatedAt: timestamp
    });

    // Update escrow status
    await adminDb.doc(`escrows/${bookingId}`).update({
      status: 'refunded',
      refundedAt: timestamp,
      refundAmount,
      refundReason: reason,
      refundId
    });

    // Log the cancellation
    await adminDb.collection('cancellation_logs').add({
      bookingId,
      escrowId: escrow.id,
      providerId: escrow.providerId,
      customerId: escrow.customerId,
      originalAmount: escrow.amount,
      refundAmount,
      refundId,
      reason,
      timestamp
    });

    // Send notifications
    await this.sendCancellationNotifications(bookingId, escrow, refundAmount, reason);
  }

  /**
   * Send notifications about booking cancellation
   */
  private async sendCancellationNotifications(
    bookingId: string,
    escrow: EscrowPayment,
    refundAmount: number,
    reason?: string
  ): Promise<void> {
    try {
      // Notification to client
      await adminDb.collection('notifications').add({
        userId: escrow.customerId,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Your booking has been cancelled. Refund amount: $${refundAmount}`,
        data: {
          bookingId,
          refundAmount,
          reason,
          type: 'booking_cancelled'
        },
        createdAt: new Date().toISOString(),
        read: false
      });

      // Notification to provider
      await adminDb.collection('notifications').add({
        userId: escrow.providerId,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Booking ${bookingId} has been cancelled${reason ? `: ${reason}` : ''}`,
        data: {
          bookingId,
          refundAmount,
          reason,
          type: 'booking_cancelled'
        },
        createdAt: new Date().toISOString(),
        read: false
      });

    } catch (error) {
      console.error('Failed to send cancellation notifications:', error);
    }
  }

  /**
   * Get refund history for a user
   */
  async getRefundHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      // Get user's bookings that were refunded
      const bookingsSnapshot = await adminDb.collection('bookings')
        .where('status', '==', 'cancelled')
        .where('paymentStatus', '==', 'refunded')
        .orderBy('refundedAt', 'desc')
        .limit(limit)
        .get();

      const refunds = bookingsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(booking => booking.clientId === userId || booking.providerId === userId);

      return refunds;

    } catch (error) {
      console.error('Error getting refund history:', error);
      return [];
    }
  }
}