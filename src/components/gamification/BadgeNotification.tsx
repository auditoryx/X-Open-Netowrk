/**
 * BadgeNotification Component
 * Shows animated notifications when badges are earned
 */

import React, { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';

interface BadgeNotificationProps {
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpBonus?: number;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const RARITY_STYLES = {
  common: {
    bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
    border: 'border-gray-400',
    glow: 'shadow-gray-200'
  },
  rare: {
    bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    border: 'border-blue-400',
    glow: 'shadow-blue-200'
  },
  epic: {
    bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
    border: 'border-purple-400',
    glow: 'shadow-purple-200'
  },
  legendary: {
    bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    border: 'border-yellow-400',
    glow: 'shadow-yellow-200'
  }
};

export default function BadgeNotification({
  badgeId,
  name,
  description,
  iconUrl,
  rarity,
  xpBonus,
  isVisible,
  onClose,
  duration = 6000
}: BadgeNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const rarityStyle = RARITY_STYLES[rarity];

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto-close after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
      setIsExiting(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`
          absolute inset-0 bg-black transition-opacity duration-300
          ${isAnimating && !isExiting ? 'opacity-50' : 'opacity-0'}
        `}
        onClick={handleClose}
      />

      {/* Notification Card */}
      <div 
        className={`
          relative bg-white rounded-xl shadow-2xl border-2 p-6 max-w-sm mx-4 pointer-events-auto
          transform transition-all duration-500 ease-out
          ${rarityStyle.border} ${rarityStyle.glow}
          ${isAnimating && !isExiting 
            ? 'scale-100 opacity-100 translate-y-0' 
            : isExiting 
              ? 'scale-95 opacity-0 translate-y-4'
              : 'scale-90 opacity-0 translate-y-8'
          }
        `}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Badge Earned Header */}
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">🎉 Badge Earned!</div>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${rarityStyle.bg}`}>
            {rarity.toUpperCase()}
          </div>
        </div>

        {/* Badge Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            {iconUrl.startsWith('/') ? (
              <img 
                src={iconUrl} 
                alt={name}
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Fallback Icon */}
            <div 
              className={`
                w-20 h-20 rounded-full flex items-center justify-center text-4xl
                ${rarityStyle.bg} border-4 ${rarityStyle.border}
                ${iconUrl.startsWith('/') ? 'hidden' : 'flex'}
              `}
              style={{ display: iconUrl.startsWith('/') ? 'none' : 'flex' }}
            >
              {getBadgeEmoji(badgeId)}
            </div>

            {/* Animated Glow Effect */}
            <div 
              className={`
                absolute inset-0 rounded-full opacity-75 animate-pulse
                ${rarityStyle.glow}
              `}
            />
          </div>
        </div>

        {/* Badge Info */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          
          {/* XP Bonus */}
          {xpBonus && (
            <div className="flex items-center justify-center space-x-2 text-indigo-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">+{xpBonus} XP Bonus!</span>
            </div>
          )}
        </div>

        {/* Confetti Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-2 h-2 ${rarityStyle.bg} rounded-full animate-bounce
                ${isAnimating ? 'opacity-100' : 'opacity-0'}
              `}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
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
