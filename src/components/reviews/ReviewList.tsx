'use client';

import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export function ReviewList({ providerId }: { providerId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const db = getFirestore(app);
      const ref = collection(db, 'users', providerId, 'reviews');
      const snap = await getDocs(ref);
      setReviews(snap.docs.map((doc) => doc.data()));
      setLoading(false);
    };

    fetchReviews();
  }, [providerId]);

  if (loading) return <p>Loading reviews...</p>;
  if (reviews.length === 0) return <p>No reviews yet.</p>;

  return (
    <div className="mt-6 w-full max-w-xl space-y-4">
      <h2 className="text-xl font-bold mb-2">Reviews</h2>
      {reviews.map((r, i) => (
        <div key={i} className="border rounded p-3 bg-white text-black">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-yellow-500">{"⭐".repeat(r.rating)}</span>
            <span className="text-sm text-gray-600">{r.rating} / 5</span>
          </div>
          <p className="text-sm">{r.text}</p>
        </div>
      ))}
    </div>
  );
}
