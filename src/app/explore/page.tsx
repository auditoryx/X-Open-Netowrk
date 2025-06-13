'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DiscoveryGrid from '@/components/explore/DiscoveryGrid';
import NewExploreGrid from '@/components/explore/NewExploreGrid';
import FilterPanel from '@/components/explore/FilterPanel';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DiscoveryMap = dynamic(() => import('@/components/explore/DiscoveryMap'), {
  ssr: false,
});
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag';
import FloatingCartButton from '@/components/cart/FloatingCartButton';
import CreatorCard from '@/components/cards/CreatorCard';
import { getFeaturedCreators } from '@/lib/firestore/getFeaturedCreators';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const newExplore = useFeatureFlag('newExplore');

  const [featured, setFeatured] = useState<any[]>([]);

  const [view, setView] = useState<'grid' | 'map'>(
    searchParams.get('view') === 'map' ? 'map' : 'grid'
  );
  const [filters, setFilters] = useState({
    role: searchParams.get('role') || '',
    location: searchParams.get('location') || '',
    service: searchParams.get('service') || '',
    genres: searchParams.get('genres')
      ? searchParams.get('genres')!.split(',').filter(Boolean)
      : [],
    minBpm: searchParams.get('minBpm')
      ? parseInt(searchParams.get('minBpm')!, 10)
      : undefined,
    maxBpm: searchParams.get('maxBpm')
      ? parseInt(searchParams.get('maxBpm')!, 10)
      : undefined,
    proTier: searchParams.get('proTier') || '',
    availableNow: searchParams.get('availableNow') === '1',
    searchNearMe: searchParams.get('searchNearMe') === 'true',
    lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
    lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
    radiusKm: searchParams.get('radiusKm') ? parseInt(searchParams.get('radiusKm')!, 10) : 50,
    sort: (searchParams.get('sort') as 'rating' | 'distance' | 'popularity') || 'rating',
  });

  useEffect(() => {
    getFeaturedCreators().then(setFeatured).catch(() => setFeatured([]));
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    if (filters.role) query.set('role', filters.role);
    if (filters.location) query.set('location', filters.location);
    if (filters.service) query.set('service', filters.service);
    if (filters.genres.length) query.set('genres', filters.genres.join(','));
    if (filters.minBpm !== undefined) query.set('minBpm', String(filters.minBpm));
    if (filters.maxBpm !== undefined) query.set('maxBpm', String(filters.maxBpm));
    if (filters.proTier) query.set('proTier', filters.proTier);
    if (filters.searchNearMe) {
      query.set('searchNearMe', 'true');
    }
    if (filters.availableNow) query.set('availableNow', '1');
    if (filters.lat) query.set('lat', String(filters.lat));
    if (filters.lng) query.set('lng', String(filters.lng));
    if (filters.radiusKm) query.set('radiusKm', String(filters.radiusKm));
    if (filters.sort) query.set('sort', filters.sort);
    query.set('view', view);
    router.replace('/explore?' + query.toString());
  }, [filters, view]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="text-right text-xs mb-2">
        <Link href="/leaderboards/tokyo/producer" className="underline">
          View Tokyo leaderboard
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Explore Creators</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 rounded border text-sm ${view === 'grid' ? 'bg-white text-black' : 'border-white text-white'}`}
          >
            Grid View
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-4 py-2 rounded border text-sm ${view === 'map' ? 'bg-white text-black' : 'border-white text-white'}`}
          >
            Map View
          </button>
        </div>
      </div>

      <FilterPanel filters={filters} setFilters={setFilters} />

      {featured.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-2">🔥 Featured Creators</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-4">
            {featured.map(c => (
              <div key={c.uid} className="min-w-[220px]">
                <CreatorCard
                  id={c.uid}
                  name={c.displayName || c.name || 'Unnamed'}
                  tagline={c.bio}
                  price={c.price}
                  location={c.location}
                  imageUrl={c.photoURL}
                  rating={c.averageRating}
                  reviewCount={c.reviewCount}
                  proTier={c.proTier}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {view === 'grid' ? (
        newExplore ? (
          <NewExploreGrid filters={filters} />
        ) : (
          <DiscoveryGrid filters={filters} />
        )
      ) : (
        <div className="h-[80vh] rounded overflow-hidden border border-white">
          <Suspense fallback={<div className="p-4">Loading map...</div>}>
            <DiscoveryMap filters={filters} />
          </Suspense>
        </div>
      )}
      <FloatingCartButton />
    </div>
  );
}
