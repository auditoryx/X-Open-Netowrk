'use client';

import { useEffect, useState } from 'react';
import { getTopCreators } from '@/lib/firestore/getTopCreators';

export default function TopCreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);

  useEffect(() => {
    getTopCreators().then(setCreators);
  }, []);

  return (
    <div className='p-8 text-white'>
      <h1 className='text-3xl font-bold mb-6'>Top Creators on AuditoryX</h1>
      {creators.length === 0 ? (
        <p className='text-gray-400'>No top creators yet.</p>
      ) : (
        <div className='space-y-4'>
          {creators.map((c, i) => (
            <div key={i} className='bg-gray-900 p-4 rounded border border-gray-700'>
              <h2 className='text-xl font-semibold text-white'>#{i + 1} – {c.providerId}</h2>
              <p className='text-yellow-400'>⭐ {c.avgRating.toFixed(2)} average rating</p>
              <p className='text-gray-400'>{c.reviewCount} review{c.reviewCount !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
