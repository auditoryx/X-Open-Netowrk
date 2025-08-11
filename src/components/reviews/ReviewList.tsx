'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  startAfter,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';

export function ReviewList({ targetId }: { targetId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const fetchReviews = useCallback((startDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
    const baseQuery = query(
      collection(db, 'reviews'),
      where(SCHEMA_FIELDS.REVIEW.TARGET_ID, '==', targetId),
      where('visible', '==', true),
      orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'),
      limit(10),
      ...(startDoc ? [startAfter(startDoc)] : [])
    );

    return onSnapshot(baseQuery, (snap) => {
      if (snap.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const newReviews = snap.docs.map(doc => doc.data());
      setReviews(prev => [...prev, ...newReviews]);
      setLastDoc(snap.docs[snap.docs.length - 1]);
      setLoading(false);
    });
  }, [targetId]);

  useEffect(() => {
    const unsub = fetchReviews();
    return () => unsub();
  }, [fetchReviews]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  return (
    <div className="mt-8 w-full max-w-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">⭐ {avgRating.toFixed(1)} / 5.0</h3>
        <p className="text-sm text-gray-400">{reviews.length} review(s)</p>
      </div>

      <div className="space-y-4">
        {reviews.map((r, idx) => {
          const comment = r.comment || 'No comment.'
          const showBlur = !user && comment.length > 120
          const display = showBlur ? comment.slice(0, 120) + '…' : comment
          return (
            <div key={idx} className="bg-gray-800 p-4 rounded relative">
              <p className="text-yellow-400 text-sm mb-1">Rating: {r.rating} / 5</p>
              <p className="text-sm text-white line-clamp-none">{display}</p>
              {showBlur && (
                <div className="pointer-events-none absolute inset-0 rounded bg-gradient-to-b from-transparent to-gray-800/80" />
              )}
            </div>
          )
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => fetchReviews(lastDoc)}
          className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
        >
          Load More
        </button>
      )}

      {loading && <div className="text-sm text-gray-400 mt-4">Loading...</div>}
    </div>
  );
}
