import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { doc, updateDoc } from 'firebase/firestore';
import { sendBookingConfirmation } from '@/lib/email/sendBookingConfirmation';

export async function POST(req: Request) {
  const buf = await req.arrayBuffer();
  const payload = Buffer.from(buf).toString();
  const sig = req.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook Error:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    // Subscription mode
    if (session.mode === 'subscription') {
      const uid = session.metadata?.uid;
      if (uid) {
        const firestore = admin.firestore();
        await firestore.collection('users').doc(uid).update({
          subscriptionStatus: 'pro',
        });
      }
    }

    // Booking mode
    if (session.mode === 'payment') {
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        const db = admin.firestore();
        await db.collection('bookings').doc(bookingId).update({
          paid: true,
          status: 'confirmed',
        });

        const testEmail = 'zenji@example.com'; // Replace w/ real user email in production
        await sendBookingConfirmation(testEmail, bookingId);
        console.log('✅ Booking confirmed →', bookingId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
