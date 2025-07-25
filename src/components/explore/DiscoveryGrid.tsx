'use client';

import React, { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { track } from '@/lib/analytics/track';
import { getNextAvailable } from '@/lib/firestore/getNextAvailable';
import { getAverageRating } from '@/lib/reviews/getAverageRating';
import { getReviewCount } from '@/lib/reviews/getReviewCount';
import { getProfileCompletion } from '@/lib/profile/getProfileCompletion';

import { Translate } from '@/i18n/Translate';
import { SaveButton } from '@/components/profile/SaveButton';
import { PointsBadge } from '@/components/profile/PointsBadge';
import GenreBadges from '@/components/explore/GenreBadges';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 rounded bg-neutral-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const creators = data?.pages?.flatMap(p => p.results) || [];

  if (creators.length === 0) {
    return <p className="p-4 text-gray-400"><Translate t="explore.noCreators" /></p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {creators.map((creator: any) => (
        <div
          key={creator.uid}
          className="rounded border border-white p-4 transition hover:bg-white hover:text-black"
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1 text-lg font-bold">
              {creator.name || <Translate t="common.unnamed" />}
              {creator.isVerified && <VerifiedBadge />}
            </h2>
            <SaveButton providerId={creator.uid} />
          </div>

          {creator.rating !== null && (
            <p className="mb-1 text-sm text-yellow-500">
              ⭐ {creator.rating.toFixed(1)} ({creator.count})
            </p>
          )}

          <p className="mb-2 line-clamp-2 text-sm text-gray-500">
            {creator.bio || <Translate t="common.noBio" />}
          </p>

          <p className="mb-1 text-xs text-blue-400">
            📊 {creator.completion}% Profile Complete
          </p>

          {(creator.role === 'artist' || creator.role === 'producer') && (
            <>
              <GenreBadges genres={(creator.genres || []).slice(0, 3)} />
              {creator.minBpm && creator.maxBpm && (
                <span className="mr-1 rounded-full bg-neutral-700 px-2 py-0.5 text-xs">
                  {creator.minBpm}-{creator.maxBpm} BPM
                </span>
              )}
            </>
          )}

          <PointsBadge points={creator.points} />

          <button
            className="mt-2 rounded border px-4 py-1 text-sm"
            onClick={() => router.push(`/profile/${creator.uid}`)}
          >
            <Translate t="common.viewProfile" />
          </button>
        </div>
      ))}
    </div>
  );
}
