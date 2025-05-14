import getStripe from './getStripe';

export async function initiateBookingWithStripe(formData: any) {
  try {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok || !data.bookingId) {
      console.error('Booking creation failed', data);
      return { success: false };
    }

    const stripeSession = await fetch('/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ bookingId: data.bookingId }),
    });

    const { sessionId } = await stripeSession.json();
    const stripe = await getStripe();

    if (stripe) {
      await stripe.redirectToCheckout({ sessionId });
      return { success: true };
    } else {
      console.error('Stripe not initialized');
      return { success: false };
    }
  } catch (err) {
    console.error('Booking error:', err);
    return { success: false };
  }
}
