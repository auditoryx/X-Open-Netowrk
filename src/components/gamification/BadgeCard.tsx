/**
 * BadgeCard Component
 * Displays individual badge with progress, rarity, and earned status
 */

import React from 'react';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';

interface BadgeCardProps {
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'milestone' | 'achievement' | 'tier' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  isEarned: boolean;
  awardedAt?: Timestamp;
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const RARITY_COLORS = {
  common: {
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    glow: '',
    badge: 'bg-gray-100 text-gray-600'
  },
  rare: {
    border: 'border-blue-300',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    glow: 'shadow-blue-200',
    badge: 'bg-blue-100 text-blue-600'
  },
  epic: {
    border: 'border-purple-300',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    glow: 'shadow-purple-200',
    badge: 'bg-purple-100 text-purple-600'
  },
  legendary: {
    border: 'border-yellow-400',
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    glow: 'shadow-yellow-200 shadow-lg',
    badge: 'bg-yellow-100 text-yellow-700'
  }
};

const SIZE_CLASSES = {
  small: {
    container: 'w-24 h-28',
    icon: 'w-8 h-8',
    text: 'text-xs',
    progress: 'h-1'
  },
  medium: {
    container: 'w-32 h-36',
    icon: 'w-12 h-12',
    text: 'text-sm',
    progress: 'h-2'
  },
  large: {
    container: 'w-40 h-44',
    icon: 'w-16 h-16',
    text: 'text-base',
    progress: 'h-2'
  }
};

export default function BadgeCard({
  badgeId,
  name,
  description,
  iconUrl,
  category,
  rarity,
  progress,
  isEarned,
  awardedAt,
  showProgress = true,
  size = 'medium',
  className = ''
}: BadgeCardProps) {
  const rarityStyle = RARITY_COLORS[rarity];
  const sizeStyle = SIZE_CLASSES[size];

  const formatAwardedDate = (timestamp: Timestamp) => {
    return new Date(timestamp.toMillis()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`
        relative rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer
        ${rarityStyle.border} ${rarityStyle.bg} ${rarityStyle.glow}
        ${sizeStyle.container} ${className}
        ${isEarned ? 'opacity-100' : 'opacity-60'}
      `}
      title={`${name}: ${description}`}
    >
      {/* Rarity Badge */}
      <div className={`
        absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium
        ${rarityStyle.badge} capitalize
      `}>
        {rarity}
      </div>

      {/* Earned Indicator */}
      {isEarned && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      <div className="p-3 h-full flex flex-col items-center justify-between">
        {/* Badge Icon */}
        <div className="flex-shrink-0 mb-2">
          {iconUrl.startsWith('/') ? (
            <Image 
              src={iconUrl} 
              alt={name}
              width={48}
              height={48}
              className={`${sizeStyle.icon} object-contain`}
              onError={(e) => {
                // Fallback to emoji icon if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback Icon */}
          <div 
            className={`
              ${sizeStyle.icon} rounded-full flex items-center justify-center text-2xl
              ${rarityStyle.bg} ${rarityStyle.border} border
              ${iconUrl.startsWith('/') ? 'hidden' : 'flex'}
            `}
            style={{ display: iconUrl.startsWith('/') ? 'none' : 'flex' }}
          >
            {getBadgeEmoji(category, badgeId)}
          </div>
        </div>

        {/* Badge Info */}
        <div className="text-center flex-grow flex flex-col justify-center">
          <h3 className={`font-semibold ${sizeStyle.text} ${rarityStyle.text} mb-1 line-clamp-2`}>
            {name}
          </h3>
          
          {size !== 'small' && (
            <p className={`text-xs text-gray-600 line-clamp-2 mb-2`}>
              {description}
            </p>
          )}

          {/* Progress Bar */}
          {showProgress && !isEarned && (
            <div className="w-full">
              <div className={`bg-gray-200 rounded-full ${sizeStyle.progress} mb-1`}>
                <div 
                  className={`bg-gradient-to-r from-blue-400 to-purple-500 ${sizeStyle.progress} rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {progress.current} / {progress.target}
              </div>
            </div>
          )}

          {/* Awarded Date */}
          {isEarned && awardedAt && size !== 'small' && (
            <div className="text-xs text-gray-500 mt-1">
              Earned {formatAwardedDate(awardedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get emoji based on badge category and ID
function getBadgeEmoji(category: string, badgeId: string): string {
  const emojiMap: Record<string, string> = {
    // Specific badge IDs
    session_starter: '🎵',
    certified_mix: '⭐',
    studio_regular: '🏢',
    verified_pro: '✅',
    
    // Category fallbacks
    milestone: '🏆',
    achievement: '🎖️',
    tier: '👑',
    special: '🌟'
  };

  return emojiMap[badgeId] || emojiMap[category] || '🏅';
}
