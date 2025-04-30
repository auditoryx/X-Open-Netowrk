'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export function ReviewList({ providerId }: { providerId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const q = query(collection(db, 'reviews'), where('providerId', '==', providerId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => doc.data());
      setReviews(data);
      setLoading(false);
    };

    fetchReviews();
  }, [providerId]);

  if (loading) return <div className="text-sm text-gray-400">Loading reviews...</div>;
  if (reviews.length === 0) return <div className="text-sm text-gray-400">No reviews yet.</div>;

  const avgRating =
    reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;

  return (
    <div className="mt-8 w-full max-w-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">⭐ {avgRating.toFixed(1)} / 5.0</h3>
        <p className="text-sm text-gray-400">{reviews.length} review(s)</p>
      </div>

      <div className="space-y-4">
        {reviews.map((r, idx) => (
          <div key={idx} className="bg-gray-800 p-4 rounded">
            <p className="text-yellow-400 text-sm mb-1">Rating: {r.rating} / 5</p>
            <p className="text-sm text-white">{r.comment || 'No comment.'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
