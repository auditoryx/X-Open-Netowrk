'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  tooltip?: string;
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5'
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
};

export default function VerifiedBadge({ 
  className = '', 
  size = 'sm', 
  showText = true,
  tooltip = "Verified Creator - This user has been verified by our team"
}: VerifiedBadgeProps) {
  const badge = (
    <span
      data-testid="verified-badge"
      className={`
        inline-flex items-center gap-1 
        rounded-full font-semibold tracking-wide
        bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700
        text-white shadow-lg
        border border-blue-400
        ${showText ? sizeStyles[size] : 'p-1'}
        ${className}
      `}
      title={tooltip}
      aria-label={tooltip}
    >
      <CheckCircle className={iconSizes[size]} />
      {showText && 'Verified'}
    </span>
  );

  return badge;
}

// Icon-only version for compact spaces
export function VerifiedIcon({ 
  className = '', 
  size = 'sm',
  tooltip = "Verified Creator"
}: Omit<VerifiedBadgeProps, 'showText'>) {
  return (
    <span
      data-testid="verified-icon"
      className={`
        inline-flex items-center justify-center
        rounded-full
        bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700
        text-white shadow-lg
        border border-blue-400
        p-1
        ${className}
      `}
      title={tooltip}
      aria-label={tooltip}
    >
      <CheckCircle className={iconSizes[size]} />
    </span>
  );
}
