import React, { useEffect, useState } from 'react';
import { getUserTier, UserTierData } from '@/lib/firestore/getUserTier';
import { getUserLeaderboardPosition } from '@/lib/firestore/getLeaderboard';
import { TierBadge } from '@/src/components/badges/TierBadge';
import { Star, TrendingUp, Award, Target } from 'lucide-react';

interface RankProgressProps {
  userId: string;
  userRole: string;
  className?: string;
}

export function RankProgress({ userId, userRole, className = '' }: RankProgressProps) {
  const [tierData, setTierData] = useState<UserTierData | null>(null);
  const [leaderboardPosition, setLeaderboardPosition] = useState<{
    weeklyRank?: number;
    allTimeRank?: number;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tierInfo, leaderboardInfo] = await Promise.all([
          getUserTier(userId),
          getUserLeaderboardPosition(userId, userRole)
        ]);
        
        setTierData(tierInfo);
        setLeaderboardPosition(leaderboardInfo);
      } catch (error) {
        console.error('Error fetching rank data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userRole]);

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          <div className="h-2 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!tierData) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Award className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Your Rank</h3>
        </div>
        <TierBadge tier={tierData.tier} size="sm" />
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-2xl font-bold text-white">{tierData.xp.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-400">Total XP</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-2xl font-bold text-white">
              {leaderboardPosition.allTimeRank ? `#${leaderboardPosition.allTimeRank}` : 'Unranked'}
            </span>
          </div>
          <p className="text-sm text-gray-400">All-Time Rank</p>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {tierData.nextTier && tierData.xpToNextTier && tierData.tierProgress !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">
              Progress to {tierData.nextTier}
            </span>
            <span className="text-sm text-purple-400">
              {tierData.xpToNextTier.toLocaleString()} XP needed
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${tierData.tierProgress}%` }}
            />
          </div>
          
          <div className="text-center mt-2">
            <span className="text-xs text-gray-400">
              {tierData.tierProgress.toFixed(1)}% complete
            </span>
          </div>
        </div>
      )}

      {/* Weekly Rank */}
      {leaderboardPosition.weeklyRank && (
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">This Week</span>
            </div>
            <span className="font-semibold text-blue-400">
              #{leaderboardPosition.weeklyRank}
            </span>
          </div>
        </div>
      )}

      {/* Achievement Hint */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Complete more bookings and get reviews to earn XP and climb the leaderboard!
        </p>
      </div>
    </div>
  );
}
