'use client';

import React, { useEffect, useState } from 'react';
import { getFavoriteCreators } from '@/lib/firestore/getFavoriteCreators';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [creators, setCreators] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      const results = await getFavoriteCreators(user.uid);
      setCreators(results);
    };
    fetch();
  }, [user]);

  if (!user) return <div className="p-6 text-white">Please log in.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">⭐ Your Saved Creators</h1>
      {creators.length === 0 ? (
        <p>No favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((c) => (
            <div key={c.id} className="border p-4 rounded hover:bg-white hover:text-black transition">
              <h2 className="text-xl font-semibold">{c.name || 'Unnamed Creator'}</h2>
              <p className="text-sm mb-2">{c.bio || 'No bio provided.'}</p>
              <button
                className="border px-4 py-1 rounded text-sm"
                onClick={() => router.push(`/profile/${c.id}`)}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
