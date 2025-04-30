import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateBookingStatus } from '@/lib/firestore/updateBookingStatus';
import { stripe } from '@/lib/stripe/createCheckoutSession';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, endpointSecret);
  } catch (err) {
    console.error('❌ Stripe webhook signature verification failed.', err);
    return new NextResponse('Webhook Error', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session?.metadata?.bookingId;
      const uid = session?.metadata?.uid;

      if (bookingId) {
        await updateBookingStatus(bookingId, 'paid');
        console.log(`✅ Booking ${bookingId} marked as paid.`);
      }

      if (session.mode === 'subscription' && uid) {
        const admin = (await import('@/lib/firebase-admin')).default;
        await admin.firestore().collection('users').doc(uid).update({
          subscriptionStatus: 'pro',
        });
        console.log(`🌟 Subscription activated for user ${uid}`);
      }

      break;
    }

    case 'payment_intent.succeeded': {
      console.log('✅ Payment intent succeeded.');
      break;
    }

    case 'payout.paid': {
      const payout = event.data.object as any;
      const bookingId = payout?.metadata?.bookingId;
      const uid = payout?.metadata?.uid;

      if (uid && bookingId) {
        const admin = (await import('@/lib/firebase-admin')).default;
        await admin.firestore().collection('users').doc(uid).collection('bookings').doc(bookingId).update({
          payoutStatus: 'paid',
        });
        console.log(`💸 Payout confirmed for booking ${bookingId}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse('Received', { status: 200 });
}
