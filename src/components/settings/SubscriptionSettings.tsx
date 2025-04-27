"use client";

import { useState } from 'react';

export default function SubscriptionSettings() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    const res = await fetch('/api/stripe/subscribe');
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
    setLoading(false);
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">AuditoryX Pro Subscription</h2>
      <p className="mb-6">Upgrade to Pro for premium benefits: lower fees, featured listings, and more.</p>
      <button
        onClick={handleSubscribe}
        className="bg-black text-white px-6 py-2 rounded hover:opacity-90"
        disabled={loading}
      >
        {loading ? 'Redirecting...' : 'Upgrade to Pro'}
      </button>
    </div>
  );
}
