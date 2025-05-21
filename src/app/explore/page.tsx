'use client';

import React, { useState } from 'react';
import DiscoveryGrid from '@/components/explore/DiscoveryGrid';
import GlobalMapPage from '../map/page';

export default function ExplorePage() {
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [tier, setTier] = useState('');
  const [role, setRole] = useState('');

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Explore Creators</h1>
        <div className="flex gap-2 items-center">
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="text-black px-2 py-1 rounded"
          >
            <option value="">All Tiers</option>
            <option value="verified">Verified</option>
            <option value="signature">Signature</option>
          </select>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="text-black px-2 py-1 rounded"
          >
            <option value="">All Roles</option>
            <option value="artist">Artist</option>
            <option value="producer">Producer</option>
            <option value="engineer">Engineer</option>
            <option value="studio">Studio</option>
            <option value="videographer">Videographer</option>
          </select>
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 rounded border ${
              view === 'grid' ? 'bg-white text-black' : 'border-white text-white'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-4 py-2 rounded border ${
              view === 'map' ? 'bg-white text-black' : 'border-white text-white'
            }`}
          >
            Map View
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <DiscoveryGrid filters={{ proTier: tier, role }} />
      ) : (
        <div className="h-[80vh] rounded overflow-hidden border border-white">
          <GlobalMapPage />
        </div>
      )}
    </div>
  );
}
