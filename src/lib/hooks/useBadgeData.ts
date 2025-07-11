/**
 * useBadgeData Hook
 * Provides badge data and management functions for components
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { badgeService, BadgeProgress } from '@/lib/services/badgeService';

interface BadgeDataState {
  badges: BadgeProgress[];
  loading: boolean;
  error: string | null;
}

interface BadgeStats {
  totalBadges: number;
  earnedBadges: number;
  inProgressBadges: number;
  percentageComplete: number;
  latestBadge?: BadgeProgress;
}

export function useBadgeData() {
  const { user } = useAuth();
  const [state, setState] = useState<BadgeDataState>({
    badges: [],
    loading: false,
    error: null
  });

  // Fetch badge data for current user
  const fetchBadgeData = useCallback(async () => {
    if (!user) {
      setState({ badges: [], loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const badgeProgress = await badgeService.getUserBadgeProgress(user.uid);
      
      setState({
        badges: badgeProgress,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching badge data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load badge data'
      }));
    }
  }, [user]);

  // Calculate badge statistics
  const getBadgeStats = useCallback((): BadgeStats => {
    const totalBadges = state.badges.length;
    const earnedBadges = state.badges.filter(badge => badge.isEarned).length;
    const inProgressBadges = state.badges.filter(
      badge => !badge.isEarned && badge.progress.percentage > 0
    ).length;
    const percentageComplete = totalBadges > 0 ? (earnedBadges / totalBadges) * 100 : 0;

    // Find latest earned badge
    const latestBadge = state.badges
      .filter(badge => badge.isEarned && badge.awardedAt)
      .sort((a, b) => {
        if (!a.awardedAt || !b.awardedAt) return 0;
        return b.awardedAt.toMillis() - a.awardedAt.toMillis();
      })[0];

    return {
      totalBadges,
      earnedBadges,
      inProgressBadges,
      percentageComplete,
      latestBadge
    };
  }, [state.badges]);

  // Get badges by category
  const getBadgesByCategory = useCallback(() => {
    const categories = {
      milestone: state.badges.filter(badge => badge.category === 'milestone'),
      achievement: state.badges.filter(badge => badge.category === 'achievement'),
      tier: state.badges.filter(badge => badge.category === 'tier'),
      special: state.badges.filter(badge => badge.category === 'special')
    };

    return categories;
  }, [state.badges]);

  // Get badges by rarity
  const getBadgesByRarity = useCallback(() => {
    const rarities = {
      common: state.badges.filter(badge => badge.rarity === 'common'),
      rare: state.badges.filter(badge => badge.rarity === 'rare'),
      epic: state.badges.filter(badge => badge.rarity === 'epic'),
      legendary: state.badges.filter(badge => badge.rarity === 'legendary')
    };

    return rarities;
  }, [state.badges]);

  // Get next achievable badges (sorted by how close to completion)
  const getNextAchievableBadges = useCallback((limit = 3) => {
    return state.badges
      .filter(badge => !badge.isEarned && badge.progress.percentage > 0)
      .sort((a, b) => b.progress.percentage - a.progress.percentage)
      .slice(0, limit);
  }, [state.badges]);

  // Get recently earned badges
  const getRecentlyEarnedBadges = useCallback((limit = 3) => {
    return state.badges
      .filter(badge => badge.isEarned && badge.awardedAt)
      .sort((a, b) => {
        if (!a.awardedAt || !b.awardedAt) return 0;
        return b.awardedAt.toMillis() - a.awardedAt.toMillis();
      })
      .slice(0, limit);
  }, [state.badges]);

  // Check if user has earned specific badge
  const hasBadge = useCallback((badgeId: string) => {
    return state.badges.some(badge => badge.badgeId === badgeId && badge.isEarned);
  }, [state.badges]);

  // Get specific badge progress
  const getBadgeProgress = useCallback((badgeId: string) => {
    return state.badges.find(badge => badge.badgeId === badgeId);
  }, [state.badges]);

  // Refresh badge data
  const refreshBadgeData = useCallback(() => {
    fetchBadgeData();
  }, [fetchBadgeData]);

  // Auto-fetch on mount and user change
  useEffect(() => {
    fetchBadgeData();
  }, [fetchBadgeData]);

  // Auto-refresh every 5 minutes to catch new badges
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchBadgeData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, fetchBadgeData]);

  return {
    // State
    badges: state.badges,
    loading: state.loading,
    error: state.error,

    // Statistics
    stats: getBadgeStats(),

    // Utility functions
    getBadgesByCategory,
    getBadgesByRarity,
    getNextAchievableBadges,
    getRecentlyEarnedBadges,
    hasBadge,
    getBadgeProgress,
    refreshBadgeData,

    // Actions
    refetch: fetchBadgeData
  };
}

// Hook for admin badge statistics
export function useAdminBadgeStats() {
  const [stats, setStats] = useState({
    totalBadges: 0,
    totalAwarded: 0,
    awardsByBadge: {} as Record<string, number>,
    recentAwards: [] as any[],
    loading: false,
    error: null as string | null
  });

  const fetchAdminStats = useCallback(async () => {
    setStats(prev => ({ ...prev, loading: true, error: null }));

    try {
      const badgeStats = await badgeService.getBadgeStatistics();
      
      setStats({
        ...badgeStats,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching admin badge stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load badge statistics'
      }));
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  return {
    ...stats,
    refetch: fetchAdminStats
  };
}
