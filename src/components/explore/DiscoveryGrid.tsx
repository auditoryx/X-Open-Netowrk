'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics/track';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getNextAvailable } from '@/lib/firestore/getNextAvailable';
import { SaveButton } from '@/components/profile/SaveButton';
import { getAverageRating } from '@/lib/reviews/getAverageRating';
import { getReviewCount } from '@/lib/reviews/getReviewCount';
import { useRouter } from 'next/navigation';
import { getProfileCompletion } from '@/lib/profile/getProfileCompletion';
import { PointsBadge } from '@/components/profile/PointsBadge';
import { Translate } from '@/i18n/Translate';
import GenreBadges from '@/components/explore/GenreBadges';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

type Page = { results: any[]; nextCursor?: string };

export default function DiscoveryGrid({ filters }: { filters: any }) {
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
          const next = await getNextAvailable(c.uid);
          const rating = await getAverageRating(c.uid);
          const count = await getReviewCount(c.uid);
          const completion = getProfileCompletion(c);
          return { ...c, next, rating, count, completion };
        })
      );
      return { results: withMeta, nextCursor: json.nextCursor };
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
  if (data && data.pages[0].results.length === 0) return (<p className="p-4 text-gray-400">No creators found.<\/p>);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const router = useRouter();

  if (isLoading)
  if (data && data.pages[0].results.length === 0) return (<p className="p-4 text-gray-400">No creators found.<\/p>);
      <div className="text-white">
        <Translate t="explore.loadingResults" />
      </div>
    );

  const creators = data?.pages.flatMap(p => p.results) ?? [];

  if (data && data.pages[0].results.length === 0) return (<p className="p-4 text-gray-400">No creators found.<\/p>);
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {creators.map((creator: any) => (
        <div
          key={creator.uid}
          className="border border-white p-4 rounded hover:bg-white hover:text-black transition"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">
              {creator.name || <Translate t="common.unnamed" />} {creator.isVerified && <VerifiedBadge />}
            </h2>
            <SaveButton providerId={creator.uid} />
          </div>
          {creator.rating !== null && (
            <p className="text-yellow-500 text-sm mb-1">
              ⭐ {creator.rating.toFixed(1)} / 5.0 ({creator.count})
            </p>
          )}
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {creator.bio || <Translate t="common.noBio" />}
          </p>
          <p className="text-xs text-blue-400 mb-1">📊 {creator.completion}% Profile Complete</p>
          { (creator.role === 'artist' || creator.role === 'producer') && (
            <>
              <GenreBadges genres={(creator.genres || []).slice(0,3)} />
              {creator.minBpm && creator.maxBpm && (
                <span className="bg-neutral-700 text-xs px-2 py-0.5 rounded-full mr-1">
                  {creator.minBpm}-{creator.maxBpm} BPM
                </span>
              )}
            </>
          ) }
          <PointsBadge points={creator.points} />
          <button
            className="border px-4 py-1 rounded text-sm"
            onClick={() => router.push(`/profile/${creator.uid}`)}
            aria-label={`${(<Translate t="common.viewProfile" />)} ${creator.name}` as unknown as string}
          >
            <Translate t="common.viewProfile" />
          </button>
        </div>
      ))}
    </div>
  );
}
