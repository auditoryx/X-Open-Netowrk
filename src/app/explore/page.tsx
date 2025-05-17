'use client';

import React, { useState } from 'react';
import DiscoveryGrid from '@/components/explore/DiscoveryGrid';
import GlobalMapPage from '../map/page';

export default function ExplorePage() {
  const [view, setView] = useState<'grid' | 'map'>('grid');

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Explore Creators</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 rounded border ${view === 'grid' ? 'bg-white text-black' : 'border-white text-white'}`}
          >
            Grid View
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-4 py-2 rounded border ${view === 'map' ? 'bg-white text-black' : 'border-white text-white'}`}
          >
            Map View
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <DiscoveryGrid />
      ) : (
        <div className="h-[80vh] rounded overflow-hidden border border-white">
          <GlobalMapPage />
        </div>
      )}
    </div>
  );
}
