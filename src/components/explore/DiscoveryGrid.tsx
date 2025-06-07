'use client';

import { useEffect, useState } from 'react';
import { getNextAvailable } from '@/lib/firestore/getNextAvailable';
import { SaveButton } from '@/components/profile/SaveButton';
import { getAverageRating } from '@/lib/reviews/getAverageRating';
import { getReviewCount } from '@/lib/reviews/getReviewCount';
import { useRouter } from 'next/navigation';
import { getProfileCompletion } from '@/lib/profile/getProfileCompletion';
import { PointsBadge } from '@/components/profile/PointsBadge';

export default function DiscoveryGrid({ filters }: { filters: any }) {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams();
      if (filters.role) params.set('role', filters.role);
      if (filters.location) params.set('location', filters.location);
      if (filters.service) params.set('service', filters.service);
      if (filters.keyword) params.set('q', filters.keyword);
      if (filters.proTier) params.set('proTier', filters.proTier);
      if (filters.searchNearMe) {
        params.set('searchNearMe', 'true');
        if (filters.lat) params.set('lat', String(filters.lat));
        if (filters.lng) params.set('lng', String(filters.lng));
      }
      const res = await fetch('/api/search?' + params.toString());
      const results = await res.json();

      const withMeta = await Promise.all(
        results.map(async (c: any) => {
          const next = await getNextAvailable(c.uid);
          const rating = await getAverageRating(c.uid);
          const count = await getReviewCount(c.uid);
          const completion = getProfileCompletion(c);
          return { ...c, next, rating, count, completion };
        })
      );

      setCreators(withMeta);
      setLoading(false);
    };

    load();
  }, [filters]);

  if (loading) return <div className="text-white">Loading results...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {creators.map((creator: any) => (
        <div
          key={creator.uid}
          className="border border-white p-4 rounded hover:bg-white hover:text-black transition"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">{creator.name || 'Unnamed'}</h2>
            <SaveButton providerId={creator.uid} />
          </div>
          {creator.rating !== null && (
            <p className="text-yellow-500 text-sm mb-1">
              ⭐ {creator.rating.toFixed(1)} / 5.0 ({creator.count})
            </p>
          )}
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{creator.bio || 'No bio provided.'}</p>
          <p className="text-xs text-blue-400 mb-1">📊 {creator.completion}% Profile Complete</p>
          <PointsBadge points={creator.points} />
          <button
            className="border px-4 py-1 rounded text-sm"
            onClick={() => router.push(`/profile/${creator.uid}`)}
          >
            View Profile
          </button>
        </div>
      ))}
    </div>
  );
}
