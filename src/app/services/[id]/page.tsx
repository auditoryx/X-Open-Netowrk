'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { getAverageRating, getReviewCount } from '@/lib/reviews';
import { useCart } from '@/context/CartContext';
import { SaveButton } from '@/components/profile/SaveButton';

export default function ServiceDetailPage() {
  const { id: rawId } = useParams();
  const id = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '';
  const router = useRouter();
  const { addItem } = useCart();

  const [service, setService] = useState<any>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchService = async () => {
      const db = getFirestore(app);
      const ref = doc(db, 'services', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setService(data);

        const [avg, count] = await Promise.all([
          getAverageRating(id),
          getReviewCount(id),
        ]);
        setRating(avg);
        setReviewCount(count);
      } else {
        setService(null);
      }
      setLoading(false);
    };
    fetchService();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-white">Loading service…</div>;
  }

  if (!service) {
    return <div className="p-8 text-red-400">Service not found.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl py-12 px-6 space-y-6">
        <h1 className="text-4xl font-bold">{service.title || 'Untitled Service'}</h1>
        {rating !== null && (
          <p className="text-sm text-yellow-400">
            ⭐ {rating.toFixed(1)} ({reviewCount})
          </p>
        )}
        <p className="text-gray-400">{service.description || 'No description provided.'}</p>

        <div className="flex items-center justify-between border-y py-4">
          <div>
            <p className="text-sm text-gray-300">Provided by</p>
            <p className="font-semibold">{service.creatorName}</p>
          </div>
          <SaveButton providerId={service.creatorId} />
        </div>

        <p className="text-lg">
          💵 <strong>${service.price}</strong>
        </p>

        <button
          onClick={() =>
            addItem({
              serviceId: id,
              serviceName: service.title,
              price: service.price,
            })
          }
          className="btn btn-primary mt-4"
        >
          Add to Cart
        </button>

        <button
          onClick={() => router.push(`/profile/${service.creatorId}`)}
          className="mt-2 text-sm underline"
        >
          View provider profile →
        </button>
      </div>
    </div>
  );
}
