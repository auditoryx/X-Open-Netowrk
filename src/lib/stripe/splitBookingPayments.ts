import { SplitBooking } from '@/lib/types/Booking';

export interface StripeCheckoutOptions {
  bookingId: string;
  clientUid: string;
  amount: number; // in cents
  isClientA: boolean;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface StripeSessionResponse {
  sessionId: string;
  url: string;
  clientSecret?: string;
}

/**
 * Create a Stripe checkout session for a split booking payment
 */
export async function createSplitBookingCheckout({
  bookingId,
  clientUid,
  amount,
  isClientA,
  successUrl,
  cancelUrl,
  metadata = {}
}: StripeCheckoutOptions): Promise<StripeSessionResponse> {
  try {
    const response = await fetch('/api/stripe/create-split-booking-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        clientUid,
        amount,
        isClientA,
        successUrl,
        cancelUrl,
        metadata: {
          bookingId,
          clientUid,
          clientRole: isClientA ? 'clientA' : 'clientB',
          ...metadata
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create checkout session: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
}

/**
 * Process a successful payment for a split booking
 */
export async function processSplitBookingPayment(
  sessionId: string,
  bookingId: string,
  clientUid: string,
  isClientA: boolean
): Promise<void> {
  try {
    const response = await fetch('/api/stripe/process-split-booking-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        bookingId,
        clientUid,
        isClientA
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to process payment: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

/**
 * Refund a split booking payment
 */
export async function refundSplitBookingPayment(
  bookingId: string,
  clientUid: string,
  reason?: string
): Promise<void> {
  try {
    const response = await fetch('/api/stripe/refund-split-booking-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        clientUid,
        reason
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to process refund: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
}

/**
 * Calculate the payment amounts for a split booking
 */
export function calculateSplitPayments(booking: SplitBooking) {
  const totalCostCents = Math.round(booking.totalCost * 100);
  const clientAShareCents = Math.round(booking.clientAShare * 100);
  const clientBShareCents = Math.round(booking.clientBShare * 100);

  // Ensure the split adds up to the total (handle rounding)
  const difference = totalCostCents - (clientAShareCents + clientBShareCents);
  
  return {
    totalCostCents,
    clientAShareCents: clientAShareCents + Math.max(0, difference),
    clientBShareCents: clientBShareCents + Math.max(0, -difference),
    clientAShareDollars: booking.clientAShare,
    clientBShareDollars: booking.clientBShare,
    totalCostDollars: booking.totalCost
  };
}

/**
 * Create payment URLs for split booking
 */
export function createPaymentUrls(bookingId: string, baseUrl: string = window.location.origin) {
  return {
    successUrl: `${baseUrl}/dashboard/bookings/split/${bookingId}?payment=success`,
    cancelUrl: `${baseUrl}/dashboard/bookings/split/${bookingId}?payment=cancelled`,
    returnUrl: `${baseUrl}/dashboard/bookings/split/${bookingId}`
  };
}

/**
 * Check if both clients have paid for a split booking
 */
export function isSplitBookingFullyPaid(booking: SplitBooking): boolean {
  return booking.clientAPaymentStatus === 'paid' && booking.clientBPaymentStatus === 'paid';
}

/**
 * Check if a client needs to pay for their share
 */
export function clientNeedsPayment(booking: SplitBooking, clientUid: string): boolean {
  const isClientA = booking.clientAUid === clientUid;
  const isClientB = booking.clientBUid === clientUid;
  
  if (isClientA) {
    return booking.status === 'confirmed' && booking.clientAPaymentStatus === 'pending';
  } else if (isClientB) {
    return booking.status === 'confirmed' && booking.clientBPaymentStatus === 'pending';
  }
  
  return false;
}

/**
 * Get payment status for a specific client
 */
export function getClientPaymentStatus(booking: SplitBooking, clientUid: string) {
  const isClientA = booking.clientAUid === clientUid;
  const isClientB = booking.clientBUid === clientUid;
  
  if (isClientA) {
    return {
      status: booking.clientAPaymentStatus || 'pending',
      amount: booking.clientAShare,
      stripeSessionId: booking.stripeSessionIds?.clientA
    };
  } else if (isClientB) {
    return {
      status: booking.clientBPaymentStatus || 'pending',
      amount: booking.clientBShare,
      stripeSessionId: booking.stripeSessionIds?.clientB
    };
  }
  
  return null;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Calculate platform fee (if any)
 */
export function calculatePlatformFee(amount: number, feePercentage: number = 0.05): number {
  return Math.round(amount * feePercentage * 100) / 100;
}
