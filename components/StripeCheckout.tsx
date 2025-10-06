'use client';

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

// ✅ Define the stripePromise using your public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Props {
  amount: number;
  bookingId: string;
}

export default function StripeCheckout({ amount, bookingId }: Props) {
  const handleClick = async () => {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookingId }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Failed to create Stripe session');
      return;
    }

    const stripe = await stripePromise;
    if (!stripe) {
      console.error('Stripe failed to initialize');
      return;
    }

    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  return (
    <button
      onClick={handleClick}
      className="mt-2 px-3 py-1 bg-purple-600 text-white rounded"
    >
      Pay ¥{amount}
    </button>
  );
}
