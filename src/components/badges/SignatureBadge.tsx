'use client';

import React from 'react';

interface SignatureBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5'
};

export default function SignatureBadge({ className = '', size = 'sm' }: SignatureBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 
        rounded-full font-semibold tracking-wide
        bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700
        text-white shadow-lg
        border border-purple-400
        ${sizeStyles[size]}
        ${className}
      `}
      title="Signature Creator - Premium verified talent"
    >
      <svg 
        className="w-3 h-3" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
          clipRule="evenodd" 
        />
      </svg>
      💎 Signature
    </span>
  );
}
