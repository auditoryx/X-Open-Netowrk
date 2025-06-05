'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

interface Review {
  id: string;
  text: string;
  rating: number;
  clientId?: string;
  createdAt?: any;
  reviewerName?: string;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchReviews = async () => {
      const snap = await getDocs(collection(db, 'users', user.uid, 'reviews'));
      const items: Review[] = [];

      for (const r of snap.docs) {
        const data = r.data() as any;
        let reviewerName = 'Unknown';
        if (data.clientId) {
          const uSnap = await getDoc(doc(db, 'users', data.clientId));
          if (uSnap.exists()) {
            reviewerName = (uSnap.data() as any).name || 'Unnamed';
          }
        }
        items.push({ id: r.id, reviewerName, ...data });
      }

      setReviews(items);
      setLoading(false);
    };

    fetchReviews();
  }, [user?.uid]);

  if (!user) {
    return <div className="p-6 text-white">Please log in.</div>;
  }

  if (loading) {
    return <div className="p-6 text-white">Loading reviews...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">My Reviews</h1>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center">No reviews yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border border-neutral-700 p-4 rounded">
                <p className="text-sm text-gray-400 mb-1">From: {r.reviewerName}</p>
                <p className="text-yellow-400 mb-1">Rating: {r.rating} / 5</p>
                <p className="text-sm">{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
