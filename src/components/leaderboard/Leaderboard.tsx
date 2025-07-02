'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getLeaderboard, getTopCreators, LeaderboardEntry } from '@/src/lib/firestore/getLeaderboard';
import { TierBadge } from '@/src/components/badges/TierBadge';
import { SkeletonCard } from '@/src/components/ui/SkeletonCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react';

interface LeaderboardProps {
  role?: string; // Specific role leaderboard, or undefined for global
  timeframe?: 'weekly' | 'allTime';
  maxEntries?: number;
  showTierBadges?: boolean;
  className?: string;
}

export function Leaderboard({ 
  role, 
  timeframe = 'allTime', 
  maxEntries = 10,
  showTierBadges = true,
  className = ''
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'weekly' | 'allTime'>(timeframe);

  useEffect(() => {
    fetchLeaderboardData();
  }, [role, selectedTimeframe, maxEntries]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let leaderboardEntries: LeaderboardEntry[] = [];
      
      if (role) {
        // Get leaderboard for specific role
        const leaderboard = await getLeaderboard(role);
        if (leaderboard) {
          leaderboardEntries = leaderboard[selectedTimeframe] || [];
        }
      } else {
        // Get global top creators
        leaderboardEntries = await getTopCreators(selectedTimeframe, maxEntries);
      }
      
      setEntries(leaderboardEntries.slice(0, maxEntries));
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {rank}
            </span>
          </div>
        );
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600';
    return 'bg-gradient-to-r from-blue-400 to-blue-600';
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Trophy}
        title="Unable to Load Leaderboard"
        description={error}
        action={{ label: 'Try Again', onClick: fetchLeaderboardData }}
      />
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No Leaderboard Data"
        description={
          role 
            ? `No creators found for ${role} leaderboard`
            : 'No leaderboard data available yet'
        }
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Leaderboard` : 'Top Creators'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Showing top {entries.length} creators by XP
            </p>
          </div>
        </div>
        
        {/* Timeframe Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setSelectedTimeframe('weekly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTimeframe === 'weekly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setSelectedTimeframe('allTime')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTimeframe === 'allTime'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {entries.slice(0, 3).map((entry, index) => {
            const actualRank = index + 1;
            return (
              <div
                key={entry.userId}
                className={`text-center ${
                  actualRank === 1 ? 'order-2' : actualRank === 2 ? 'order-1' : 'order-3'
                }`}
              >
                <div
                  className={`relative mx-auto mb-4 ${
                    actualRank === 1 ? 'w-24 h-24' : 'w-20 h-20 mt-4'
                  }`}
                >
                  <Image
                    src={entry.profileImage || '/images/default-avatar.png'}
                    alt={entry.displayName}
                    fill
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div
                    className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${getRankBadgeColor(
                      actualRank
                    )}`}
                  >
                    <span className="text-white font-bold text-sm">{actualRank}</span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {entry.displayName}
                </h3>
                
                {showTierBadges && (
                  <div className="flex justify-center mb-2">
                    <TierBadge tier={entry.tier} size="sm" />
                  </div>
                )}
                
                <div className="flex items-center justify-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {(selectedTimeframe === 'weekly' ? entry.weeklyXp : entry.xp)?.toLocaleString()} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {entries.slice(entries.length >= 3 ? 3 : 0).map((entry, index) => {
          const actualRank = (entries.length >= 3 ? 3 : 0) + index + 1;
          return (
            <div
              key={entry.userId}
              className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              {/* Rank */}
              <div className="flex-shrink-0">
                {getRankIcon(actualRank)}
              </div>

              {/* Profile Image */}
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={entry.profileImage || '/images/default-avatar.png'}
                  alt={entry.displayName}
                  fill
                  className="rounded-full object-cover"
                />
              </div>

              {/* Name and Tier */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {entry.displayName}
                  </h4>
                  {showTierBadges && (
                    <TierBadge tier={entry.tier} size="xs" />
                  )}
                </div>
              </div>

              {/* XP */}
              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">
                  {(selectedTimeframe === 'weekly' ? entry.weeklyXp : entry.xp)?.toLocaleString()} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Leaderboard updates every hour
      </div>
    </div>
  );
}
