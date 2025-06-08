'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DiscoveryGrid from '@/components/explore/DiscoveryGrid';
import NewExploreGrid from '@/components/explore/NewExploreGrid';
import FilterPanel from '@/components/explore/FilterPanel';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DiscoveryMap = dynamic(() => import('@/components/explore/DiscoveryMap'), {
  ssr: false,
});
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const newExplore = useFeatureFlag('newExplore');

  const [view, setView] = useState<'grid' | 'map'>(
    searchParams.get('view') === 'map' ? 'map' : 'grid'
  );
  const [filters, setFilters] = useState({
    role: searchParams.get('role') || '',
    location: searchParams.get('location') || '',
    service: searchParams.get('service') || '',
    proTier: searchParams.get('proTier') || '',
    availableNow: searchParams.get('availableNow') === '1',
    searchNearMe: searchParams.get('searchNearMe') === 'true',
    lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
    lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
    radiusKm: searchParams.get('radiusKm') ? parseInt(searchParams.get('radiusKm')!, 10) : 50,
    sort: (searchParams.get('sort') as 'rating' | 'distance' | 'popularity') || 'rating',
  });

  useEffect(() => {
    const query = new URLSearchParams();
    if (filters.role) query.set('role', filters.role);
    if (filters.location) query.set('location', filters.location);
    if (filters.service) query.set('service', filters.service);
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
    </div>
  );
}
