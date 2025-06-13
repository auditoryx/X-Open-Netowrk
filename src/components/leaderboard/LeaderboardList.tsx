'use client';

import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { fetchLeaderboard, LeaderboardEntry } from '@/lib/leaderboards';

export default function LeaderboardList({ period }: { period: 'weekly' | 'monthly' }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(period)
      .then(data => setEntries(data))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading && entries.length === 0) {
    return <Skeleton count={6} height={48} className="mb-2 rounded" />;
  }

  if (entries.length === 0) {
    return <p className="text-sm text-gray-400">No entries</p>;
  }

  return (
    <ol className="space-y-2">
      {entries.map((e, i) => (
        <li key={e.uid} className="border border-neutral-700 p-2 rounded">
          #{i + 1} {e.uid} - {e.points} XP
        </li>
      ))}
    </ol>
  );
}
