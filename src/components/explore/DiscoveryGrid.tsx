'use client';

import React, { useEffect, useState } from 'react';
import FilterPanel from './FilterPanel';
import { queryCreators } from '@/lib/firestore/explore/queryCreators';
import { getNextAvailable } from '@/lib/firestore/getNextAvailable';
import CreatorCard from '@/components/cards/CreatorCard';

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

      // Fetch next available slot per creator (optional optimization)
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
    <div>
      <FilterPanel filters={filters} setFilters={setFilters} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
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
