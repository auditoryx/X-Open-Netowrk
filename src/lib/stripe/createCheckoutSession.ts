import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function createCheckoutSession({
  bookingId,
  price,
  buyerEmail,
}: {
  bookingId: string;
  price: number;
  buyerEmail: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: buyerEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Service Booking',
          },
          unit_amount: price * 100,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      capture_method: 'manual',
      metadata: { bookingId },
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/bookings`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/bookings`,
  });

  // Save paymentIntentId to Firestore for later capture
  const pi = session.payment_intent as string;
  await updateDoc(doc(db, 'bookings', bookingId), {
    paymentIntentId: pi,
  });

  return session.url;
}
