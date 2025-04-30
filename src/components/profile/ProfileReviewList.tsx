'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

type Review = {
  text: string;
  rating: number;
  fromUser?: string;
};

export default function ProfileReviewList({ uid }: { uid: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'reviews'), where('toUser', '==', uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => doc.data() as Review);
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [uid]);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading reviews...</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-gray-400">No reviews yet.</p>;
  }

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-lg font-semibold">Reviews</h3>
      {reviews.map((r, i) => (
        <div key={i} className="border p-3 rounded bg-gray-800">
          <p className="text-yellow-400">Rating: {r.rating}★</p>
          <p className="text-sm text-gray-200 mt-1">{r.text}</p>
        </div>
      ))}
    </div>
  );
}
