'use client';

import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useRouter, useParams } from 'next/navigation';
import { SaveButton } from '@/components/profile/SaveButton';
import { getAverageRating } from '@/lib/reviews/getAverageRating';
import { getReviewCount } from '@/lib/reviews/getReviewCount';
import { useAuth } from '@/lib/hooks/useAuth';
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag';

export default function ExploreRolePage() {
  const { role: rawRole } = useParams();
  const role = typeof rawRole === 'string' ? rawRole : Array.isArray(rawRole) ? rawRole[0] : '';
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, userData } = useAuth();
  const newExploreEnabled = useFeatureFlag('newExplore');

  useEffect(() => {
    const fetchCreators = async () => {
      const db = getFirestore(app);
      const ref = collection(db, 'users');
      const q = query(ref, where('role', '==', role));
      const snap = await getDocs(q);

      const rawCreators = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const withRatings = await Promise.all(
        rawCreators.map(async (creator) => {
          const averageRating = await getAverageRating(creator.id);
          const reviewCount = await getReviewCount(creator.id);
          return { ...creator, averageRating, reviewCount };
        })
      );

      const sorted = [...withRatings].sort((a, b) => {
        if (b.averageRating === a.averageRating) {
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        }
        return (b.averageRating || 0) - (a.averageRating || 0);
      });

      setCreators(sorted);
      setLoading(false);
    };

    fetchCreators();
  }, [role]);

  const toggleNewExplore = async () => {
    if (!user) return;
    const db = getFirestore(app);
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    const data = snap.data();
    const flags = data?.featureFlags || {};
    const current = flags.newExplore || false;

    await updateDoc(ref, {
      featureFlags: { ...flags, newExplore: !current },
    });

    window.location.reload();
  };

  if (loading) {
    return <div className="p-6 text-white">Loading explore...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 capitalize">{role} Services</h1>

        {userData?.isAdmin && (
          <div className="mb-6">
            <button
              onClick={toggleNewExplore}
              className="px-4 py-2 border rounded hover:bg-white hover:text-black transition"
            >
              🧪 Toggle New Explore Layout
            </button>
          </div>
        )}

        {creators.length === 0 ? (
          <p>No creators found.</p>
        ) : newExploreEnabled ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className="rounded-xl border border-neutral-700 p-4 hover:bg-neutral-800 transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold">{creator.name || 'Unnamed'}</h2>
                  <SaveButton providerId={creator.id} />
                </div>
                {creator.averageRating !== null && (
                  <p className="text-yellow-400 text-sm mb-1">
                    ⭐ {creator.averageRating.toFixed(1)} ({creator.reviewCount})
                  </p>
                )}
                <p className="text-sm text-gray-300 line-clamp-2">{creator.bio || 'No bio.'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className="border p-4 rounded hover:bg-white hover:text-black transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">{creator.name || 'Unnamed Creator'}</h2>
                  <SaveButton providerId={creator.id} />
                </div>

                {creator.averageRating !== null && (
                  <p className="text-yellow-400 text-sm mb-1">
                    ⭐ {creator.averageRating.toFixed(1)} / 5.0
                    <span className="text-gray-400"> ({creator.reviewCount} reviews)</span>
                  </p>
                )}

                <p className="text-sm mb-2">{creator.bio || 'No bio provided.'}</p>
                <button
                  className="border px-4 py-1 rounded text-sm"
                  onClick={() => router.push(`/profile/${creator.id}`)}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
