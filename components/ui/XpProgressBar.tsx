'use client';

import React from 'react';
import { Trophy, Flame, Star } from 'lucide-react';

interface XpProgressBarProps {
  /** Current XP amount */
  currentXp: number;
  /** XP needed for next level/tier */
  nextLevelXp: number;
  /** Current streak count */
  currentStreak?: number;
  /** Array of badge names/IDs earned */
  badges?: string[];
  /** Current tier */
  tier?: 'standard' | 'verified' | 'signature';
  /** Whether to show compact version */
  compact?: boolean;
}

export default function XpProgressBar({
  currentXp,
  nextLevelXp,
  currentStreak = 0,
  badges = [],
  tier = 'standard',
  compact = false
}: XpProgressBarProps) {
  const progressPercentage = Math.min((currentXp / nextLevelXp) * 100, 100);
  const remainingXp = Math.max(nextLevelXp - currentXp, 0);

  const getTierColor = (userTier: string) => {
    switch (userTier) {
      case 'signature':
        return 'from-purple-500 to-indigo-600';
      case 'verified':
        return 'from-blue-500 to-cyan-600';
      case 'standard':
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTierBadge = (userTier: string) => {
    switch (userTier) {
      case 'signature':
        return '👑';
      case 'verified':
        return '✅';
      case 'standard':
      default:
        return '🎯';
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
        {/* XP Progress */}
        <div className="flex items-center gap-1 md:gap-2">
          <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          <span className="text-gray-300 whitespace-nowrap">{currentXp} XP</span>
        </div>

        {/* Streak */}
        {currentStreak > 0 && (
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-orange-400 whitespace-nowrap">{currentStreak}</span>
          </div>
        )}

        {/* Tier */}
        <div className="flex items-center gap-1">
          <span className="flex-shrink-0">{getTierBadge(tier)}</span>
          <span className="text-gray-400 capitalize text-xs whitespace-nowrap">{tier}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-white">Progress</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg">{getTierBadge(tier)}</span>
          <span className="text-sm text-gray-400 capitalize">{tier}</span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>XP: {currentXp.toLocaleString()}</span>
          <span>Next: {remainingXp.toLocaleString()} XP</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getTierColor(tier)} transition-all duration-500 ease-out relative`}
            style={{ width: `${progressPercentage}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          {progressPercentage.toFixed(1)}% to next tier
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Streak */}
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <div>
            <div className="text-sm font-medium text-white">{currentStreak}</div>
            <div className="text-xs text-gray-400">Day Streak</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <div className="text-sm">🏆</div>
          <div>
            <div className="text-sm font-medium text-white">{badges.length}</div>
            <div className="text-xs text-gray-400">Badges</div>
          </div>
        </div>
      </div>

      {/* Recent Badges Preview */}
      {badges.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Recent badges:</div>
          <div className="flex gap-1">
            {badges.slice(-3).map((badge, index) => (
              <div
                key={index}
                className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs"
                title={`Badge: ${badge}`}
              >
                🏆
              </div>
            ))}
            {badges.length > 3 && (
              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-gray-300">
                +{badges.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}