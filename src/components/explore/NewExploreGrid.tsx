'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { queryCreators } from '@/lib/firestore/queryCreators';
import { getAverageRating } from '@/lib/reviews/getAverageRating';
import { getReviewCount } from '@/lib/reviews/getReviewCount';
import { SaveButton } from '@/components/profile/SaveButton';
import { getProfileCompletion } from '@/lib/profile/getProfileCompletion';
import { PointsBadge } from '@/components/profile/PointsBadge';

export default function NewExploreGrid({ filters }: { filters: any }) {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      const results = await queryCreators(filters);

      const withRatings = await Promise.all(
        results.map(async (c: any) => {
          const averageRating = await getAverageRating(c.uid);
          const reviewCount = await getReviewCount(c.uid);
          const completion = getProfileCompletion(c);
          return { ...c, averageRating, reviewCount, completion };
        })
      );

      setCreators(withRatings);
      setLoading(false);
    };

    fetch();
  }, [filters]);

  if (loading) return <div className="text-white">Loading new layout...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {creators.map((c: any) => (
        <div
          key={c.uid}
          id={`creator-${c.uid}`}
          className="border border-white p-4 rounded-xl hover:bg-neutral-900 transition scroll-mt-24"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg">
              {c.name || 'Unnamed'}
            </h2>
            <SaveButton providerId={c.uid} />
          </div>

          <p className="text-sm text-gray-400">
            {c.location || 'Unknown Location'}
          </p>

          {c.averageRating !== null && (
            <p className="text-yellow-400 text-sm mb-1">
              ⭐ {c.averageRating.toFixed(1)} / 5.0 ({c.reviewCount})
            </p>
          )}

          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {c.bio || 'No bio available.'}
          </p>

          <p className="text-xs text-blue-400">
            📊 {c.completion}% Profile Complete
          </p>

          {/* XP / gamification badge */}
          <PointsBadge points={c.points} />

          {/* CTA */}
          <button
            className="btn btn-primary w-full mt-2"
            onClick={() => router.push(`/profile/${c.uid}`)}
          >
            View Profile
          </button>
        </div>
      ))}
    </div>
  );
}
