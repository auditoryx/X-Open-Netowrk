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
  const getNextTierName = (currentTier: string) => {
    switch (currentTier) {
      case 'standard': return 'VERIFIED';
      case 'verified': return 'SIGNATURE';
      case 'signature': return 'MAX LEVEL';
      default: return 'NEXT TIER';
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
      <div className="flex items-center justify-between mb-4">
        <span className="text-brutalist-mono">
          XP PROGRESS
        </span>
        <span className="text-brutalist-mono opacity-80">
          {isMaxTier ? (
            <span className="text-white">MAX LEVEL REACHED!</span>
          ) : (
            `${currentXp}/${requirement} XP TO ${nextTier}`
          )}
        </span>
      </div>
      
      <div className="progress-brutalist mb-4">
        <div 
          className="progress-brutalist-fill transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-brutalist">
          {currentTier.toUpperCase()} TIER
        </span>
        
        {!isMaxTier && (
          <span className="text-brutalist-mono opacity-60">
            {Math.round(progress)}% COMPLETE
          </span>
        )}
      </div>
    </div>
  );
}