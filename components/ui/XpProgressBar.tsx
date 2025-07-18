'use client';

import React from 'react';

interface XpProgressBarProps {
  currentXp: number;
  nextTierXp: number;
  currentTier: 'standard' | 'verified' | 'signature';
  className?: string;
}

export default function XpProgressBar({ 
  currentXp, 
  nextTierXp, 
  currentTier,
  className = ''
}: XpProgressBarProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'signature': return 'bg-gradient-to-r from-purple-500 to-indigo-600';
      case 'verified': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getNextTierName = (currentTier: string) => {
    switch (currentTier) {
      case 'standard': return 'Verified';
      case 'verified': return 'Signature';
      case 'signature': return 'Max Level';
      default: return 'Next Tier';
    }
  };

  const getTierRequirement = (tier: string) => {
    switch (tier) {
      case 'standard': return 1000;
      case 'verified': return 2000;
      case 'signature': return 2000; // Already at max
      default: return 1000;
    }
  };

  const nextTier = getNextTierName(currentTier);
  const requirement = getTierRequirement(currentTier);
  const progress = currentTier === 'signature' ? 100 : Math.min((currentXp / requirement) * 100, 100);
  const isMaxTier = currentTier === 'signature';

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium text-gray-700">
          XP Progress
        </span>
        <span className="text-gray-600">
          {isMaxTier ? (
            <span className="text-purple-600 font-medium">Max Level Reached!</span>
          ) : (
            `${currentXp}/${requirement} XP to ${nextTier}`
          )}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out ${getTierColor(currentTier)}`}
          style={{ width: `${progress}%` }}
        >
          <div className="h-full bg-white bg-opacity-20 animate-pulse"></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs mt-1">
        <span className={`font-medium capitalize ${
          currentTier === 'signature' ? 'text-purple-600' :
          currentTier === 'verified' ? 'text-blue-600' :
          'text-gray-600'
        }`}>
          {currentTier} Tier
        </span>
        
        {!isMaxTier && (
          <span className="text-gray-500">
            {Math.round(progress)}% complete
          </span>
        )}
      </div>
    </div>
  );
}