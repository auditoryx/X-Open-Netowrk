import React from 'react';

interface TierBadgeProps {
  tier: 'gray' | 'blue' | 'gold';
  frozen?: boolean;
  children?: React.ReactNode;
}

const tierStyles: Record<string, string> = {
  gray: 'border-gray-400 text-gray-500 bg-gray-100',
  blue: 'border-blue-400 text-blue-600 bg-blue-100',
  gold: 'border-yellow-400 text-yellow-700 bg-yellow-100',
};

const tierLabels: Record<string, string> = {
  gray: 'Gray',
  blue: 'Blue',
  gold: 'Gold',
};

const TierBadge: React.FC<TierBadgeProps> = ({ tier, frozen = false, children }) => (
  <span
    className={`relative ml-2 text-xs px-2 py-0.5 rounded-full border font-semibold tracking-wide ${tierStyles[tier]}`}
    style={{ opacity: frozen ? 0.7 : 1 }}
  >
    {children ?? tierLabels[tier]}
    {frozen && (
      <span
        className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="#fff" strokeWidth="2" />
          <rect x="7" y="9" width="6" height="5" rx="1" fill="#fff" />
          <rect x="8.5" y="6" width="3" height="5" rx="1.5" fill="#fff" />
        </svg>
      </span>
    )}
  </span>
);

export default TierBadge;
