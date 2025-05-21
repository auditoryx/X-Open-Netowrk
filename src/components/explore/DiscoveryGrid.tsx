'use client';

import React, { useEffect, useState } from 'react';
import FilterPanel from './FilterPanel';
import { queryCreators } from '@/lib/firestore/explore/queryCreators';
import { getNextAvailable } from '@/lib/firestore/getNextAvailable';
import CreatorCard from '@/components/cards/CreatorCard';

const LOCATIONS = [
  'Tokyo', 'Los Angeles', 'New York', 'Seoul', 'London',
  'Paris', 'Toronto', 'Berlin', 'Sydney', 'Remote',
];

const DiscoveryGrid = () => {
  const [creators, setCreators] = useState<any[]>([]);
  const [nextAvailabilities, setNextAvailabilities] = useState<Record<string, string | null>>({});
  const [filters, setFilters] = useState({
    role: '',
    verifiedOnly: false,
    location: '',
    service: '',
    proTier: '',
  });

  useEffect(() => {
    const fetchCreators = async () => {
      const result = await queryCreators(filters);
      const sorted = result.sort((a, b) => {
        const tierOrder = { signature: 0, verified: 1, standard: 2 };
        return (tierOrder[a.proTier] ?? 3) - (tierOrder[b.proTier] ?? 3);
      });
      setCreators(sorted);

      const availabilityMap: Record<string, string | null> = {};
      await Promise.all(
        sorted.map(async (creator: any) => {
          const next = await getNextAvailable(creator.uid);
          availabilityMap[creator.uid] = next;
        })
      );
      setNextAvailabilities(availabilityMap);
    };
    fetchCreators();
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* 🔍 Filters */}
      <div className="sticky top-0 z-20 bg-black border-b border-white pb-4 mb-6">
        <FilterPanel filters={filters} setFilters={setFilters} />

        {/* 🔰 Tier Dropdown */}
        <div className="flex gap-4 mt-2">
          <select
            value={filters.proTier}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, proTier: e.target.value }))
            }
            className="text-black px-2 py-1 rounded"
          >
            <option value="">All Tiers</option>
            <option value="signature">Signature</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>

      {/* 🌍 Location Filter Chips */}
      <div className="flex flex-wrap gap-2 py-2">
        {LOCATIONS.map((loc) => (
          <button
            key={loc}
            onClick={() => setFilters((prev) => ({ ...prev, location: loc }))}
            className={`px-4 py-1 rounded-full border text-sm ${
              filters.location === loc
                ? 'bg-white text-black border-white'
                : 'bg-neutral-800 text-white border-neutral-600 hover:bg-neutral-700'
            }`}
          >
            {loc}
          </button>
        ))}
        {filters.location && (
          <button
            onClick={() => setFilters((prev) => ({ ...prev, location: '' }))}
            className="ml-2 text-sm underline text-gray-400"
          >
            Clear
          </button>
        )}
      </div>

      {/* 📡 Creator Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {creators.map((c) => (
          <CreatorCard
            key={c.uid}
            id={c.uid}
            name={c.displayName}
            price={c.price ?? 0}
            tagline={c.bio || 'No description yet'}
            location={c.location || 'Unknown'}
            rating={c.rating}
            reviewCount={c.reviewCount}
            verified={c.verified}
            imageUrl={c.profileImage || ''}
            proTier={c.proTier}
          />
        ))}
      </div>
    </div>
  );
};

export default DiscoveryGrid;
