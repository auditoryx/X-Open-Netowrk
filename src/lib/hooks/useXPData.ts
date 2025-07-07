import { useState, useEffect, useCallback } from 'react';
import { xpService, UserProgress, XPTransaction } from '@/lib/services/xpService';
import { useAuth } from '@/lib/hooks/useAuth';

interface UseXPDataResult {
  userProgress: UserProgress | null;
  xpHistory: XPTransaction[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  dailyCapRemaining: number;
  nextTierProgress: {
    currentTier: string;
    nextTier: string;
    xpNeeded: number;
    progress: number;
  } | null;
}

// Tier progression thresholds
const TIER_THRESHOLDS = {
  standard: { xp: 0, label: 'Standard' },
  verified: { xp: 1000, label: 'Verified' },
  signature: { xp: 2000, label: 'Signature' }
};

export const useXPData = (): UseXPDataResult => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [xpHistory, setXpHistory] = useState<XPTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch user progress and XP history in parallel
      const [progress, history] = await Promise.all([
        xpService.getUserProgress(user.uid),
        xpService.getUserXPHistory(user.uid, 20) // Last 20 transactions
      ]);

      setUserProgress(progress);
      setXpHistory(history);
    } catch (err) {
      console.error('Error fetching XP data:', err);
      setError('Failed to load XP data');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Calculate daily cap remaining
  const dailyCapRemaining = userProgress 
    ? Math.max(0, 300 - userProgress.dailyXP) 
    : 300;

  // Calculate next tier progress
  const nextTierProgress = userProgress ? (() => {
    const currentXP = userProgress.totalXP;
    const currentTier = userProgress.tier;

    // Find next tier
    const tiers = Object.entries(TIER_THRESHOLDS).sort((a, b) => a[1].xp - b[1].xp);
    const currentIndex = tiers.findIndex(([tier]) => tier === currentTier);
    
    if (currentIndex === -1 || currentIndex === tiers.length - 1) {
      return null; // Already at highest tier
    }

    const nextTierEntry = tiers[currentIndex + 1];
    const [nextTier, nextTierData] = nextTierEntry;
    const xpNeeded = nextTierData.xp - currentXP;
    const progress = Math.min((currentXP / nextTierData.xp) * 100, 100);

    return {
      currentTier: TIER_THRESHOLDS[currentTier as keyof typeof TIER_THRESHOLDS].label,
      nextTier: nextTierData.label,
      xpNeeded: Math.max(0, xpNeeded),
      progress
    };
  })() : null;

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!user?.uid) return;

    const interval = setInterval(() => {
      refreshData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.uid, refreshData]);

  return {
    userProgress,
    xpHistory,
    loading,
    error,
    refreshData,
    dailyCapRemaining,
    nextTierProgress
  };
};
