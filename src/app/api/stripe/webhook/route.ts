import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin'; // Make sure your admin SDK is setup

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
    if (session.mode === 'subscription') {
      const uid = session.metadata?.uid;
      if (uid) {
        await admin.firestore().collection('users').doc(uid).update({
          subscriptionStatus: 'pro',
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
