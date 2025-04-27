import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';

// Initialize Firebase app (avoid duplicate apps)
import { firebaseConfig } from '@/app/firebase';
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export const config = {
  api: { bodyParser: false }
};

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const buf = await req.arrayBuffer();
  const body = Buffer.from(buf);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const buyerId = session.metadata?.buyerId;
    const providerId = session.metadata?.providerId;
    const serviceId = session.metadata?.serviceId;

    if (buyerId && providerId && serviceId) {
      await addDoc(collection(db, 'bookingRequests'), {
        buyerId,
        providerId,
        serviceId,
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      console.log('Booking request auto‐created from Stripe webhook.');
    }
  }

  return NextResponse.json({ received: true });
}
