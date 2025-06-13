'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';

import { track } from '@/lib/analytics/track';
import { getNextAvailable } from '@/lib/firestore/getNextAvailable';
import { getAverageRating } from '@/lib/reviews/getAverageRating';
import { getReviewCount } from '@/lib/reviews/getReviewCount';
import { getProfileCompletion } from '@/lib/profile/getProfileCompletion';

import { SaveButton } from '@/components/profile/SaveButton';
import { PointsBadge } from '@/components/profile/PointsBadge';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import GenreBadges from '@/components/explore/GenreBadges';
import { Translate } from '@/i18n/Translate';

type Page = { results: any[]; nextCursor?: string };

export default function DiscoveryGrid({ filters }: { filters: any }) {
  const router = useRouter();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<Page>({
    queryKey: ['creators', filters],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '20', ...filters });
      if (filters.availableNow) params.set('availableNow', '1');
      if (pageParam) params.append('cursor', pageParam as string);

      track('search', { ...filters, page: pageParam ?? 1 });

      const res = await fetch(`/api/search?${params.toString()}`);
      const json = await res.json();

      const withMeta = await Promise.all(
        json.results.map(async (c: any) => {
          const next        = await getNextAvailable(c.uid);
          const rating      = await getAverageRating(c.uid);
          const count       = await getReviewCount(c.uid);
          const completion  = getProfileCompletion(c);
          return { ...c, next, rating, count, completion };
        }),
      );

      return { results: withMeta, nextCursor: json.nextCursor };
    },
    getNextPageParam: last => last.nextCursor ?? undefined,
  });

  /* infinite-scroll on window */
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* ───────── Render states ───────── */

  if (isLoading) {
    return <Skeleton count={6} height={100} className="mb-4 rounded" />;
  }

  const creators = data?.pages.flatMap(p => p.results) ?? [];

  if (creators.length === 0) {
    return <p className="p-4 text-gray-400"><Translate t="explore.noCreators" /></p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {creators.map((creator: any) => (
        <div
          key={creator.uid}
          className="border border-white p-4 rounded hover:bg-white hover:text-black transition"
        >
          {/* header */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">
              {creator.name || <Translate t="common.unnamed" />}{" "}
              {creator.isVerified && <VerifiedBadge />}
            </h2>
            <SaveButton providerId={creator.uid} />
          </div>

          {/* rating */}
          {creator.rating !== null && (
            <p className="text-yellow-500 text-sm mb-1">
              ⭐ {creator.rating.toFixed(1)} / 5.0 ({creator.count})
            </p>
          )}

          {/* bio */}
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
            {creator.bio || <Translate t="common.noBio" />}
          </p>

          {/* profile completion */}
          <p className="text-xs text-blue-400 mb-1">
            📊 {creator.completion}% <Translate t="profile.complete" />
          </p>

          {/* music-specific chips */}
          {(creator.role === 'artist' || creator.role === 'producer') && (
            <>
              <GenreBadges genres={(creator.genres || []).slice(0, 3)} />
              {creator.minBpm && creator.maxBpm && (
                <span className="bg-neutral-700 text-xs px-2 py-0.5 rounded-full mr-1">
                  {creator.minBpm}-{creator.maxBpm} BPM
                </span>
              )}
            </>
          )}

          {/* points / loyalty */}
          <PointsBadge points={creator.points} />

          {/* CTA */}
          <button
            className="border px-4 py-1 rounded text-sm mt-2"
            onClick={() => router.push(`/profile/${creator.uid}`)}
            aria-label={`${Translate.txt('common.viewProfile')} ${creator.name || ''}`}
          >
            <Translate t="common.viewProfile" />
          </button>
        </div>
      ))}
    </div>
  );
}
