"use client";

import { useEffect, useState } from 'react';
import { getTrustStats } from '@/lib/firestore/getTrustStats';
import { useAuth } from '@/lib/hooks/useAuth';

export function ProfileTrustStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ badges: [], level: '' });

  useEffect(() => {
    async function fetchStats() {
      if (user?.uid) {
        const fetched = await getTrustStats(user.uid);
        setStats(fetched);
      }
    }
    fetchStats();
  }, [user]);

  if (!user) return null;

  return (
    <div className="p-4 rounded-md border mt-4">
      <h2 className="text-lg font-bold mb-2">Profile Trust Stats</h2>
      <p className="text-sm">Level: {stats.level}</p>
      <div className="flex gap-2 mt-2">
        {stats.badges.map((badge, idx) => (
          <span key={idx} className="text-xs bg-gray-200 rounded-full px-2 py-1">
            {badge.replace('_', ' ').toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
