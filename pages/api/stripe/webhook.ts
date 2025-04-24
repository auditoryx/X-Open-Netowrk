import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { firestore } from '@/lib/firebase/init';
import { doc, updateDoc } from 'firebase/firestore';
import { sendBookingConfirmation } from '@/lib/email/sendBookingConfirmation';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig as string, endpointSecret);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;
      const bookingId = metadata?.bookingId;

      console.log('📦 Stripe Checkout Session Completed');
      console.log('🔎 Booking ID from metadata:', bookingId);

      if (bookingId) {
        const bookingRef = doc(firestore, 'bookings', bookingId);
        await updateDoc(bookingRef, {
          paid: true,
          status: 'confirmed',
        });

        const testEmail = 'zenji@example.com'; // Replace with real email later
        await sendBookingConfirmation(testEmail, bookingId);

        console.log('✅ Booking marked as paid & confirmed →', bookingId);
      } else {
        console.warn('⚠️ No bookingId found in session metadata.');
      }
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

