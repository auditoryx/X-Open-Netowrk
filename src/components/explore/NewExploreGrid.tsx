'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getFlags } from '@/lib/featureFlags';
import { SaveButton } from '@/components/profile/SaveButton';
import { getProfileCompletion } from '@/lib/profile/getProfileCompletion';
import { PointsBadge } from '@/components/profile/PointsBadge';
import { RoleBadge } from '@/components/explore/RoleBadge';
import GenreBadges from '@/components/explore/GenreBadges';
import { VerifiedIcon } from '@/components/ui/VerifiedBadge';
import { Translate } from '@/i18n/Translate';

export default function NewExploreGrid({ filters }: { filters: any }) {
  const router = useRouter();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<{ results: any[]; nextCursor?: string }>({
    queryKey: ['creators-new', filters],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '20', ...filters });
      if (filters.availableNow) params.set('availableNow', '1');
      if (pageParam) params.append('cursor', pageParam as string);
      const res = await fetch(`/api/search?${params.toString()}`);
      const json = await res.json();
      
      // Check feature flags to determine what stats to fetch
      const flags = await getFlags();
      const withStats = await Promise.all(
        json.results.map(async (c: any) => {
          const completion = getProfileCompletion(c);
          
          if (flags.POSITIVE_REVIEWS_ONLY) {
            // New approach: use credibility and positive review count
            return { 
              ...c, 
              completion,
              positiveReviewCount: c.stats?.positiveReviewCount || 0,
              completedBookings: c.stats?.completedBookings || 0,
              credibilityScore: c.credibilityScore || 0
            };
          } else {
            // Legacy approach: fetch rating data
            const { getAverageRating } = await import('@/lib/reviews/getAverageRating');
            const { getReviewCount } = await import('@/lib/reviews/getReviewCount');
            const averageRating = await getAverageRating(c.uid);
            const reviewCount = await getReviewCount(c.uid);
            return { ...c, averageRating, reviewCount, completion };
          }
        })
      );
      return { results: withStats, nextCursor: json.nextCursor };
    },
    getNextPageParam: last => last.nextCursor ?? undefined,
  });

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading)
    return (
      <div className="text-white">
        <Translate t="explore.loadingNewLayout" />
      </div>
    );

  const creators = data?.pages.flatMap(p => p.results) ?? [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {creators.map((c: any) => (
        <div
          key={c.uid}
          id={`creator-${c.uid}`}
          className="border border-white p-4 rounded-xl hover:bg-neutral-900 transition scroll-mt-24"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              {c.name || <Translate t="common.unnamed" />}
              {c.isVerified && <VerifiedIcon size="sm" />}
            </h2>
            <SaveButton providerId={c.uid} />
          </div>

          <p className="text-sm text-gray-400">
            {c.location || <Translate t="common.unknownLocation" />}
          </p>

          {c.averageRating !== null && (
            <p className="text-yellow-400 text-sm mb-1">
              ⭐ {c.averageRating.toFixed(1)} / 5.0 ({c.reviewCount})
            </p>
          )}

          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {c.bio || <Translate t="common.noBio" />}
          </p>

          <p className="text-xs text-blue-400">
            📊 {c.completion}% Profile Complete
          </p>

          {/* Role specific metric */}
          <RoleBadge role={c.role} profile={c} />

          {/* Genres & BPM */}
          {(c.role === 'artist' || c.role === 'producer') && (
            <>
              <GenreBadges genres={(c.genres || []).slice(0, 3)} />
              {c.minBpm && c.maxBpm && (
                <span className="bg-neutral-700 text-xs px-2 py-0.5 rounded-full mr-1">
                  {c.minBpm}-{c.maxBpm} BPM
                </span>
              )}
            </>
          )}

          {/* XP / gamification badge */}
          <PointsBadge points={c.points} />

          {/* CTA */}
          <button
            className="btn btn-primary w-full mt-2"
            onClick={() => router.push(`/profile/${c.uid}`)}
            aria-label={`${(<Translate t="common.viewProfile" />)} ${c.name}` as unknown as string}
          >
            <Translate t="common.viewProfile" />
          </button>
        </div>
      ))}
    </div>
  );
}
