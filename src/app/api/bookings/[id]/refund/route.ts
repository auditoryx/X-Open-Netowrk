import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/getServerUser';
import { StripeRefundService } from '@/lib/payments/stripe-refunds';

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

    // Get refund preview/details
    const preview = await refundService.getRefundPreview(bookingId);

    return NextResponse.json({
      bookingId,
      canRefund: preview.canRefund,
      refundDetails: {
        amount: preview.refundAmount,
        percentage: preview.refundPercentage,
        processingFee: preview.processingFee
      },
      policy: {
        hoursUntilBooking: preview.hoursUntilBooking,
        reason: preview.reason
      }
    });

  } catch (error) {
    console.error('Get refund details error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get refund details' 
      },
      { status: 500 }
    );
  }
}