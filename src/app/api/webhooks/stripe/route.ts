import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { updateBookingStatus } from '@/lib/firestore/updateBookingStatus';
import { markAsHeld } from '@/lib/firestore/bookings/markAsHeld';
import { generateContract } from '@/lib/firestore/contracts/generateContract';
import { logger } from '@/lib/logger';
import { Sentry } from '@lib/sentry';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, endpointSecret);
  } catch (err) {
    logger.error('❌ Stripe webhook signature verification failed.', err);
    Sentry.captureException(err);
    return new NextResponse('Webhook Error', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    const clientId = session.metadata?.buyerId;
    const providerId = session.metadata?.providerId;
    const serviceName = session.metadata?.serviceName;
    const price = session.amount_total ? session.amount_total / 100 : undefined;

    if (bookingId) {
      await updateBookingStatus(bookingId, 'paid');
      await markAsHeld({ bookingId, userId: 'system', role: 'admin' });

      if (clientId && providerId && serviceName && price) {
        const startDate = new Date().toISOString().split('T')[0];
        await generateContract(
          { bookingId, clientId, providerId, serviceName, price, startDate },
          'system'
        );
      }

      logger.info(`✅ Booking ${bookingId} marked paid and funds held.`);
    }
  }

  return new NextResponse('Received', { status: 200 });
}
