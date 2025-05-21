'use client';

import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';

export function ProfileTrustStats() {
  const { user } = useAuth();
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [level, setLevel] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);

  useEffect(() => {
    async function fetchTrustStats() {
      if (!user?.uid) return;
      const db = getFirestore(app);

      // Get reviews
      const reviewsRef = collection(db, 'users', user.uid, 'reviews');
      const snapshot = await getDocs(reviewsRef);
      const ratings = snapshot.docs.map(doc => doc.data().rating);
      if (ratings.length) {
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        setAverageRating(avg);
        setReviewCount(ratings.length);
      }

      // Fetch verified status
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setIsVerified(userDoc.data()?.verified || false);
      }

      // Optional: extra trust badges
      const res = await fetch(`/api/trust-stats?uid=${user.uid}`);
      const data = await res.json();
      setBadges(data.badges || []);
      setLevel(data.level || '');
    }

    fetchTrustStats();
  }, [user]);

  if (!user) return null;

  return (
    <div className="p-4 rounded-md border mt-4">
      {isVerified && (
        <span className="inline-block mb-2 text-blue-400 text-xs bg-blue-400/10 px-2 py-1 rounded-full">
          ✔ Verified Profile
        </span>
      )}
      <h2 className="text-lg font-bold mb-2">Profile Trust Stats</h2>
      {averageRating !== null && (
        <p className="text-sm">
          ⭐ {averageRating.toFixed(1)} / 5 ({reviewCount} reviews)
        </p>
      )}
      <p className="text-sm mt-1">Level: {level}</p>
      <div className="flex gap-2 mt-2">
        {badges.map((badge, idx) => (
          <span key={idx} className="text-xs bg-gray-200 rounded-full px-2 py-1">
            {badge.replace('_', ' ').toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
