/**
 * BadgeProgress Component
 * Shows progress toward earning specific badges
 */

import React from 'react';
import { BadgeProgress as BadgeProgressType } from '@/lib/services/badgeService';

interface BadgeProgressProps {
  badges: BadgeProgressType[];
  title?: string;
  maxVisible?: number;
  showCompleted?: boolean;
  compact?: boolean;
  className?: string;
}

const RARITY_COLORS = {
  common: 'text-gray-600',
  rare: 'text-blue-600',
  epic: 'text-purple-600',
  legendary: 'text-yellow-600'
};

export default function BadgeProgress({
  badges,
  title = "Badge Progress",
  maxVisible = 5,
  showCompleted = false,
  compact = false,
  className = ''
}: BadgeProgressProps) {
  // Filter badges based on showCompleted prop
  const filteredBadges = badges.filter(badge => 
    showCompleted ? badge.isEarned : !badge.isEarned
  );

  // Sort by progress percentage (highest first for in-progress, or by rarity for completed)
  const sortedBadges = filteredBadges
    .sort((a, b) => {
      if (showCompleted) {
        // For completed badges, sort by awarded date (newest first)
        if (a.awardedAt && b.awardedAt) {
          return b.awardedAt.toMillis() - a.awardedAt.toMillis();
        }
        return 0;
      } else {
        // For in-progress badges, sort by percentage (highest first)
        return b.progress.percentage - a.progress.percentage;
      }
    })
    .slice(0, maxVisible);

  if (sortedBadges.length === 0) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="text-center py-6 text-gray-500">
          <div className="text-2xl mb-2">🏅</div>
          <p className="text-sm">
            {showCompleted ? 'No badges earned yet' : 'All badges completed!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      
      <div className="space-y-3">
        {sortedBadges.map((badge) => (
          <BadgeProgressItem 
            key={badge.badgeId}
            badge={badge}
            compact={compact}
          />
        ))}
      </div>

      {filteredBadges.length > maxVisible && (
        <div className="mt-3 text-center">
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all {filteredBadges.length} badges →
          </button>
        </div>
      )}
    </div>
  );
}

interface BadgeProgressItemProps {
  badge: BadgeProgressType;
  compact: boolean;
}

function BadgeProgressItem({ badge, compact }: BadgeProgressItemProps) {
  const rarityColor = RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS];

  const formatAwardedDate = (timestamp: any) => {
    if (!timestamp) return '';
    return new Date(timestamp.toMillis()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
        {/* Badge Icon */}
        <div className="flex-shrink-0">
          {badge.iconUrl.startsWith('/') ? (
            <img 
              src={badge.iconUrl} 
              alt={badge.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'flex';
              }}
            />
          ) : null}
          
          <div 
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-lg
              bg-gray-100 border border-gray-200
              ${badge.iconUrl.startsWith('/') ? 'hidden' : 'flex'}
            `}
            style={{ display: badge.iconUrl.startsWith('/') ? 'none' : 'flex' }}
          >
            {getBadgeEmoji(badge.badgeId)}
          </div>
        </div>

        {/* Badge Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 truncate">{badge.name}</h4>
            {badge.isEarned ? (
              <span className="text-xs text-green-600 font-medium">Earned</span>
            ) : (
              <span className="text-xs text-gray-500">{badge.progress.percentage}%</span>
            )}
          </div>
          
          {badge.isEarned ? (
            <p className="text-xs text-gray-500">
              {badge.awardedAt && `Earned ${formatAwardedDate(badge.awardedAt)}`}
            </p>
          ) : (
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(badge.progress.percentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start space-x-3">
        {/* Badge Icon */}
        <div className="flex-shrink-0">
          {badge.isEarned && (
            <div className="absolute ml-8 -mt-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {badge.iconUrl.startsWith('/') ? (
            <img 
              src={badge.iconUrl} 
              alt={badge.name}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'flex';
              }}
            />
          ) : null}
          
          <div 
            className={`
              w-12 h-12 rounded-full flex items-center justify-center text-2xl
              bg-gray-100 border border-gray-200
              ${badge.iconUrl.startsWith('/') ? 'hidden' : 'flex'}
            `}
            style={{ display: badge.iconUrl.startsWith('/') ? 'none' : 'flex' }}
          >
            {getBadgeEmoji(badge.badgeId)}
          </div>
        </div>

        {/* Badge Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-base font-semibold text-gray-900">{badge.name}</h4>
            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gray-100 ${rarityColor}`}>
              {badge.rarity}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{badge.description}</p>

          {badge.isEarned ? (
            <div className="flex items-center space-x-2 text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">
                Earned {badge.awardedAt && formatAwardedDate(badge.awardedAt)}
              </span>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Progress: {badge.progress.current} / {badge.progress.target}</span>
                <span className="font-medium">{badge.progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(badge.progress.percentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get emoji for badge
function getBadgeEmoji(badgeId: string): string {
  const emojiMap: Record<string, string> = {
    session_starter: '🎵',
    certified_mix: '⭐',
    studio_regular: '🏢',
    verified_pro: '✅'
  };

  return emojiMap[badgeId] || '🏅';
}
