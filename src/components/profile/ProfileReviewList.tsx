'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { NoReviews } from '@/components/ui/EmptyState';
import SkeletonCard from '@/components/ui/SkeletonCard';

type Review = {
  text: string;
  rating: number;
  fromUser?: string;
};

export default function ProfileReviewList({ 
  uid, 
  isOwnProfile = false,
  onRequestReview 
}: { 
  uid: string;
  isOwnProfile?: boolean;
  onRequestReview?: () => void;
}) {
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
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-4">Reviews</h3>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCard key={i} variant="booking" showImage={false} />
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-4">Reviews</h3>
        <NoReviews 
          isOwnProfile={isOwnProfile} 
          onRequestReview={onRequestReview}
        />
      </div>
    );
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
