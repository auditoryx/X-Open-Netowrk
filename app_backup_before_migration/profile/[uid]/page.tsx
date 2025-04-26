'use client';

import { useEffect, useState } from 'react';
import { getCreatorReviews } from '@/lib/firestore/getCreatorReviews';
import { useParams } from 'next/navigation';

const renderStars = (n: number) => '⭐'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

export default function CreatorProfilePage() {
  const params = useParams();
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  useEffect(() => {
    getCreatorReviews(params.uid).then((data) => {
      setReviews(data);
      if (data.length > 0) {
        const sum = data.reduce((acc, r) => acc + (r.review.rating || 0), 0);
        const avg = sum / data.length;
        setAvgRating(avg);
      }
    });
  }, [params?.uid]);

  return (
    <div className='p-8 text-white'>
      <h1 className='text-3xl font-bold mb-4'>Creator Reviews</h1>

      {avgRating !== null && (
        <div className='text-yellow-400 text-xl font-semibold mb-6'>
          Average Rating: {renderStars(avgRating)} ({avgRating.toFixed(1)}/5)
        </div>
      )}

      {reviews.length === 0 ? (
        <p className='text-gray-400'>No reviews yet.</p>
      ) : (
        <div className='space-y-4'>
          {reviews.map((r, i) => (
            <div key={i} className='bg-gray-900 p-4 rounded border border-gray-700'>
              <div className='text-yellow-400 font-bold mb-1'>{renderStars(r.review.rating)}</div>
              <p className='text-green-400 font-semibold'>"{r.review.text}"</p>
              <p className='text-sm text-gray-400 mt-1'>— from {r.clientId}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
