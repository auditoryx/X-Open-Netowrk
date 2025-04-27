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

      if (bookingId) {
        await updateBookingStatus(bookingId, 'paid');
        console.log(\`✅ Booking \${bookingId} marked as paid.\`);
      }
      break;
    }

    case 'payment_intent.succeeded': {
      console.log('✅ Payment intent succeeded.');
      break;
    }

    default:
      console.log(\`Unhandled event type \${event.type}\`);
  }

  return new NextResponse('Received', { status: 200 });
}
