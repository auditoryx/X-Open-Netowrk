import { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';


export default function StripeCheckout({ amount, bookingId }: { amount: number; bookingId: string }) {
  useEffect(() => {
    const handleCheckout = async () => {
      const stripe = await stripePromise;

      // Make a POST request to create a Checkout session
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, bookingId }),
      });

      const session = await res.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe?.redirectToCheckout({ sessionId: session.id });
      if (error) {
        console.error('Error during checkout:', error);
      }
    };

    handleCheckout();
  }, [amount, bookingId]);

  return <button className='px-4 py-2 bg-blue-600 text-white rounded'>Pay Now</button>;
}
