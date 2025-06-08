import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

// 🔐 Optional: Auth session check can be added in API route that calls this.

const schema = z.object({
  bookingId: z.string().min(1),
  amount: z.number().positive(),
  buyerEmail: z.string().email(),
  metadata: z.record(z.any()).optional(),
});

export async function createCheckoutSession(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    console.error('Invalid checkout session input:', parsed.error.format());
    return { error: 'Invalid request' };
  }

  const { bookingId, amount, buyerEmail, metadata } = parsed.data;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: buyerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Service Booking' },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        capture_method: 'manual',
        metadata: { bookingId, ...(metadata || {}) },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/purchases/${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/bookings`,
    });

    const pi = session.payment_intent as string;
    await updateDoc(doc(db, 'bookings', bookingId), {
      paymentIntentId: pi,
    });

    return { url: session.url };
  } catch (err: any) {
    console.error('Stripe session creation failed:', err.message);
    await updateDoc(doc(db, 'errorLogs', `stripe_${bookingId}`), {
      error: err.message,
      type: 'stripe_checkout_session',
      bookingId,
      createdAt: new Date().toISOString(),
    });

    return { error: 'Stripe checkout failed' };
  }
}
