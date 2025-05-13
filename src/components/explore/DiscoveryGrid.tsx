'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import FilterPanel from './FilterPanel';
import { queryCreators } from '@/lib/firestore/explore/queryCreators';
import { getNextAvailable } from '@/lib/firestore/getNextAvailable';

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {creators.map((c) => (
          <Link key={c.uid} href={`/profile/${c.uid}`}>
            <div className="p-4 border rounded-lg hover:shadow-md">
              <h3 className="font-semibold text-lg">{c.displayName}</h3>
              <p className="text-sm text-gray-600">{c.role}</p>
              <p className="text-sm mt-1 line-clamp-2">{c.bio}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {c.verified && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    ✔ Verified
                  </span>
                )}
                {c.proTier && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    🌟 Pro
                  </span>
                )}
                {c.location && <span>{c.location}</span>}
              </div>
              {nextAvailabilities[c.uid] && (
                <p className="text-sm text-green-600 mt-1">
                  Next available: {nextAvailabilities[c.uid]}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DiscoveryGrid;
