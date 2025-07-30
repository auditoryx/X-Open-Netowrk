import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/getServerUser';
import { StripeRefundService } from '@/lib/payments/stripe-refunds';
import { z } from 'zod';

const CancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
  isEmergency: z.boolean().optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Authenticate user
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookingId = id;
    
    // Validate request body
    const body = await request.json();
    const validatedData = CancelBookingSchema.parse(body);

    // Initialize refund service
    const refundService = new StripeRefundService();

    // Process the cancellation
    const result = await refundService.processRefund({
      bookingId,
      userId: user.uid,
      reason: validatedData.reason,
      isEmergency: validatedData.isEmergency || false
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.message,
          escrowStatus: result.escrowStatus 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      refund: {
        id: result.refundId,
        amount: result.refundAmount,
        processingFee: result.processingFee
      }
    });

  } catch (error) {
    console.error('Booking cancellation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Authenticate user
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookingId = id;

    // Initialize refund service
    const refundService = new StripeRefundService();

    // Get refund preview
    const preview = await refundService.getRefundPreview(bookingId);

    return NextResponse.json({
      canCancel: preview.canRefund,
      refund: {
        amount: preview.refundAmount,
        percentage: preview.refundPercentage,
        processingFee: preview.processingFee
      },
      timing: {
        hoursUntilBooking: preview.hoursUntilBooking,
        reason: preview.reason
      }
    });

  } catch (error) {
    console.error('Refund preview error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get refund preview' 
      },
      { status: 500 }
    );
  }
}