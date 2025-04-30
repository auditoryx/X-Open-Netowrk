'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/app/firebase';
import { useRouter } from 'next/navigation';
import { SaveButton } from '@/components/profile/SaveButton';
import { getAverageRating } from '@/lib/reviews/getAverageRating';

export default function ExploreRolePage({ params }: { params: { role: string } }) {
  const [creators, setCreators] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCreators = async () => {
      const db = getFirestore(app);
      const ref = collection(db, 'users');
      const q = query(ref, where('role', '==', params.role));
      const snap = await getDocs(q);

      const rawCreators = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const withRatings = await Promise.all(
        rawCreators.map(async (creator) => {
          const avg = await getAverageRating(creator.id);
          return { ...creator, averageRating: avg };
        })
      );

      setCreators(withRatings);
    };

    fetchCreators();
  }, [params.role]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 capitalize">{params.role} Services</h1>

        {creators.length === 0 ? (
          <p>No creators found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <div key={creator.id} className="border p-4 rounded hover:bg-white hover:text-black transition">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">{creator.name || 'Unnamed Creator'}</h2>
                  <SaveButton providerId={creator.id} />
                </div>

                {creator.averageRating !== null && (
                  <p className="text-yellow-400 text-sm mb-1">
                    ⭐ {creator.averageRating.toFixed(1)} / 5.0
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
