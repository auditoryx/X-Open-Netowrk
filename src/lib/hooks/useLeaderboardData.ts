/**
 * Leaderboard Data Hook
 * Manages real-time leaderboard data and user ranking
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { rankingService, LeaderboardEntry } from '@/lib/services/rankingService';
import { useAuth } from './useAuth';

interface UseLeaderboardDataReturn {
  leaderboard: LeaderboardEntry[];
  userRanking: { rank: number; score: number; totalUsers: number } | null;
  loading: boolean;
  error: string | null;
  refreshLeaderboard: () => Promise<void>;
  category: 'global' | 'weekly' | 'verified' | 'new';
  setCategory: (category: 'global' | 'weekly' | 'verified' | 'new') => void;
}

export function useLeaderboardData(
  initialCategory: 'global' | 'weekly' | 'verified' | 'new' = 'global',
  limit: number = 50
): UseLeaderboardDataReturn {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRanking, setUserRanking] = useState<{ rank: number; score: number; totalUsers: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(initialCategory);

  /**
   * Fetch leaderboard data
   */
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [leaderboardData, userRankingData] = await Promise.all([
        rankingService.getLeaderboard(category, limit),
        user ? rankingService.getUserRanking(user.uid) : Promise.resolve(null)
      ]);

      setLeaderboard(leaderboardData);
      setUserRanking(userRankingData);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  }, [category, limit, user]);

  /**
   * Refresh leaderboard data
   */
  const refreshLeaderboard = useCallback(async () => {
    await fetchLeaderboard();
  }, [fetchLeaderboard]);

  /**
   * Fetch data when category changes or component mounts
   */
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  /**
   * Set up periodic refresh (every 5 minutes)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    userRanking,
    loading,
    error,
    refreshLeaderboard,
    category,
    setCategory
  };
}
