'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DiscoveryGrid from '@/components/explore/DiscoveryGrid';
import NewExploreGrid from '@/components/explore/NewExploreGrid';
import FilterPanel from '@/components/explore/FilterPanel';
import GlobalMapPage from '../map/page';
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const newExplore = useFeatureFlag('newExplore');

  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [filters, setFilters] = useState({
    role: searchParams.get('role') || '',
    location: searchParams.get('location') || '',
    service: searchParams.get('service') || '',
    proTier: searchParams.get('proTier') || '',
    searchNearMe: searchParams.get('searchNearMe') === 'true',
  });

  useEffect(() => {
    const query = new URLSearchParams();
    if (filters.role) query.set('role', filters.role);
    if (filters.location) query.set('location', filters.location);
    if (filters.service) query.set('service', filters.service);
    if (filters.proTier) query.set('proTier', filters.proTier);
    if (filters.searchNearMe) query.set('searchNearMe', 'true');
    router.replace('/explore?' + query.toString());
  }, [filters]);

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
          <GlobalMapPage />
        </div>
      )}
    </div>
  );
}
