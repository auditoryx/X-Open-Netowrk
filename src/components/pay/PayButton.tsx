'use client'

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { handleCheckout } from '@/lib/stripe/handleCheckout';

export default function PayButton({ service, buyerId }: { service: any; buyerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { url } = await handleCheckout({
        serviceId: service.id,
        title: service.title,
        price: service.price,
        providerId: service.creatorId,
        buyerId,
      });
      router.push(url);
    } catch (err) {
      console.error('Stripe Error:', err);
      toast.error('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="btn btn-primary px-6 py-3"
    >
      {loading ? 'Redirecting...' : 'Book Now'}
    </button>
  );
} 
//       ) : (
//         <div className="space-y-4">      
