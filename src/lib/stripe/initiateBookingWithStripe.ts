import getStripe from './getStripe';
import { z } from 'zod';

const formSchema = z.object({
  serviceId: z.string().min(1),
  providerId: z.string().min(1),
  price: z.number().positive(),
  message: z.string().optional(),
});

export async function initiateBookingWithStripe(formData: any) {
  const parsed = formSchema.safeParse(formData);
  if (!parsed.success) {
    console.error('Invalid form data:', parsed.error.format());
    return { success: false };
  }

  try {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });

    const data = await res.json();
    if (!res.ok || !data.bookingId) {
      console.error('Booking creation failed:', data);
      return { success: false };
    }

    const stripeRes = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: data.bookingId }),
    });

    const stripeData = await stripeRes.json();
    if (!stripeRes.ok || !stripeData.sessionId) {
      console.error('Stripe session creation failed:', stripeData);
      return { success: false };
    }

    const stripe = await getStripe();
    if (!stripe) {
      console.error('Stripe not initialized');
      return { success: false };
    }

    await stripe.redirectToCheckout({ sessionId: stripeData.sessionId });
    return { success: true };
  } catch (err: any) {
    console.error('Booking + Stripe error:', err.message);
    return { success: false };
  }
}
