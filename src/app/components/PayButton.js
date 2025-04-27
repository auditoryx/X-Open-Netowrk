'use client';

import { useRouter } from 'next/navigation';

export default function PayButton({ service, buyerId }) {
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          serviceTitle: service.title,
          price: service.price,
          providerId: service.creatorId,
          buyerId: buyerId,
        }),
      });

      if (res.ok) {
        const { url } = await res.json();
        router.push(url);
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error during checkout', err);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="border border-white text-white px-6 py-3 rounded hover:bg-white hover:text-black transition"
    >
      Book Now
    </button>
  );
}
