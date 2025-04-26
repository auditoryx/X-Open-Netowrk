'use client';

import { useState } from 'react';

export default function PayButton({ serviceName, price, userId }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ serviceName, price, userId }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      {loading ? 'Redirecting...' : `Pay $${price}`}
    </button>
  );
}
