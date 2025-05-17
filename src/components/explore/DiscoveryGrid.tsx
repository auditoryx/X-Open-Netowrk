'use client';

import React, { useEffect, useState } from 'react';
import FilterPanel from './FilterPanel';
import { queryCreators } from '@/lib/firestore/explore/queryCreators';
import { getNextAvailable } from '@/lib/firestore/getNextAvailable';
import CreatorCard from '@/components/cards/CreatorCard';

const LOCATIONS = [
  'Tokyo',
  'Los Angeles',
  'New York',
  'Seoul',
  'London',
  'Paris',
  'Toronto',
  'Berlin',
  'Sydney',
  'Remote',
];

const DiscoveryGrid = () => {
  const [creators, setCreators] = useState<any[]>([]);
  const [nextAvailabilities, setNextAvailabilities] = useState<Record<string, string | null>>({});
  const [filters, setFilters] = useState({
    role: '',
    verifiedOnly: false,
    location: '',
    service: '',
  });

  useEffect(() => {
    const fetchCreators = async () => {
      const result = await queryCreators(filters);
      setCreators(result);

      const availabilityMap: Record<string, string | null> = {};
      await Promise.all(
        result.map(async (creator: any) => {
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
      <FilterPanel filters={filters} setFilters={setFilters} />

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
          />
        ))}
      </div>
    </div>
  );
};

export default DiscoveryGrid;
//
// <div className="flex flex-wrap gap-2 py-2">
//   {LOCATIONS.map((loc) => (  