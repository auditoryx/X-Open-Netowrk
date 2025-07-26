/**
 * Booking Cancellation API
 * 
 * Handles booking cancellation requests with refund processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getFirestore, doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { calculateRefund, canCancelBooking, formatRefundSummary, type BookingForCancellation } from '@/lib/payments/refund-calculator';
import { processStripeRefund, validateRefundRequest } from '@/lib/payments/stripe-refunds';
import { z } from 'zod';

const db = getFirestore(app);

// Request validation schema
const CancelBookingSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500, 'Reason too long'),
  confirmRefund: z.boolean().default(false)
});

/**
 * POST /api/bookings/[id]/cancel
 * Cancel a booking and process refund
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = params.id;
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const validation = CancelBookingSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const { reason, confirmRefund } = validation.data;

    // Get booking details
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    if (!bookingDoc.exists()) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingData = bookingDoc.data();
    
    // Authorization check - only client or provider can cancel
    if (bookingData.clientId !== session.user.uid && bookingData.providerId !== session.user.uid) {
      return NextResponse.json({ error: 'Not authorized to cancel this booking' }, { status: 403 });
    }

    // Convert booking data to expected format
    const booking: BookingForCancellation = {
      id: bookingId,
      amount: bookingData.amount || 0,
      currency: bookingData.currency || 'usd',
      scheduledDateTime: bookingData.datetime ? new Date(bookingData.datetime) : new Date(),
      status: bookingData.status,
      paymentIntentId: bookingData.paymentIntentId,
      createdAt: bookingData.createdAt?.toDate() || new Date()
    };

    // Check if booking can be cancelled
    const cancellationCheck = canCancelBooking(booking);
    if (!cancellationCheck.canCancel) {
      return NextResponse.json({ 
        error: 'Cannot cancel booking', 
        reason: cancellationCheck.reason 
      }, { status: 400 });
    }

    // Calculate refund
    const refundCalculation = calculateRefund(booking, new Date(), reason);
    const refundSummary = formatRefundSummary(refundCalculation);

    // If this is just a quote request (not confirmed), return the calculation
    if (!confirmRefund) {
      return NextResponse.json({
        bookingId,
        canCancel: true,
        refundCalculation,
        refundSummary,
        message: 'Refund calculation completed. Set confirmRefund=true to proceed with cancellation.'
      });
    }

    // Process actual cancellation and refund
    let refundResult = null;
    let refundError = null;

    // Only process Stripe refund if there's a payment and amount > 0
    if (booking.paymentIntentId && refundCalculation.refundAmount > 0) {
      try {
        // Validate refund with Stripe
        const validation = await validateRefundRequest(booking.paymentIntentId, refundCalculation.refundAmount);
        if (!validation.valid) {
          return NextResponse.json({ 
            error: 'Refund validation failed', 
            details: validation.error 
          }, { status: 400 });
        }

        // Process the refund
        refundResult = await processStripeRefund(
          {
            paymentIntentId: booking.paymentIntentId,
            amount: refundCalculation.refundAmount,
            reason: 'requested_by_customer',
            metadata: {
              booking_id: bookingId,
              cancelled_by: session.user.uid,
              cancellation_reason: reason
            }
          },
          refundCalculation
        );
      } catch (error: any) {
        console.error('Refund processing failed:', error);
        refundError = error.message;
      }
    }

    // Update booking status
    const cancellationData = {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancelledBy: session.user.uid,
      cancellationReason: reason,
      refundCalculation: {
        originalAmount: refundCalculation.originalAmount,
        refundAmount: refundCalculation.refundAmount,
        refundPercentage: refundCalculation.refundPercentage,
        processingFee: refundCalculation.processingFee,
        policyApplied: refundCalculation.policyApplied.description
      },
      refundResult: refundResult ? {
        refundId: refundResult.refundId,
        amount: refundResult.amount,
        status: refundResult.status
      } : null,
      refundError,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'bookings', bookingId), cancellationData);

    // Create cancellation record for audit trail
    await addDoc(collection(db, 'cancellations'), {
      bookingId,
      clientId: bookingData.clientId,
      providerId: bookingData.providerId,
      cancelledBy: session.user.uid,
      reason,
      refundCalculation,
      refundResult,
      refundError,
      createdAt: serverTimestamp()
    });

    // Return success response
    return NextResponse.json({
      success: true,
      bookingId,
      status: 'cancelled',
      refundCalculation,
      refundSummary,
      refundResult,
      refundError,
      message: refundError 
        ? 'Booking cancelled but refund processing failed. Please contact support.'
        : 'Booking cancelled successfully. Refund will be processed within 3-5 business days.'
    });

  } catch (error: any) {
    console.error('Booking cancellation failed:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}

/**
 * GET /api/bookings/[id]/cancel
 * Get cancellation quote without actually cancelling
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = params.id;
    
    // Get booking details
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    if (!bookingDoc.exists()) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingData = bookingDoc.data();
    
    // Authorization check
    if (bookingData.clientId !== session.user.uid && bookingData.providerId !== session.user.uid) {
      return NextResponse.json({ error: 'Not authorized to view this booking' }, { status: 403 });
    }

    // Convert booking data
    const booking: BookingForCancellation = {
      id: bookingId,
      amount: bookingData.amount || 0,
      currency: bookingData.currency || 'usd',
      scheduledDateTime: bookingData.datetime ? new Date(bookingData.datetime) : new Date(),
      status: bookingData.status,
      paymentIntentId: bookingData.paymentIntentId,
      createdAt: bookingData.createdAt?.toDate() || new Date()
    };

    // Check if booking can be cancelled
    const cancellationCheck = canCancelBooking(booking);
    if (!cancellationCheck.canCancel) {
      return NextResponse.json({ 
        canCancel: false,
        reason: cancellationCheck.reason,
        bookingId 
      });
    }

    // Calculate refund
    const refundCalculation = calculateRefund(booking);
    const refundSummary = formatRefundSummary(refundCalculation);

    return NextResponse.json({
      bookingId,
      canCancel: true,
      booking: {
        amount: booking.amount,
        scheduledDateTime: booking.scheduledDateTime,
        status: booking.status
      },
      refundCalculation,
      refundSummary
    });

  } catch (error: any) {
    console.error('Cancellation quote failed:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}