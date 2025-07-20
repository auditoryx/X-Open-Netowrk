import React from 'react';
import { Crown, Star, Award, Shield, Zap, Trophy, CheckCircle } from 'lucide-react';

export type TierType = 
  | 'standard' 
  | 'verified' 
  | 'signature' 
  | 'top_1_percent' 
  | 'top_5_percent' 
  | 'top_10_percent'
  | 'rising_star'
  | 'legendary';

interface TierBadgeProps {
  tier: TierType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  frozen?: boolean;
  className?: string;
}

const tierConfig = {
  standard: {
    icon: null,
    label: 'Standard',
    color: 'bg-gray-600 text-gray-200',
    borderColor: 'border-gray-500',
    show: false // Don't show standard tier badges
  },
  verified: {
    icon: CheckCircle,
    label: 'Verified',
    color: 'bg-blue-600 text-white',
    borderColor: 'border-blue-400',
    show: true
  },
  signature: {
    icon: Award,
    label: 'Signature',
    color: 'bg-purple-600 text-white',
    borderColor: 'border-purple-400',
    show: true
  },
  top_1_percent: {
    icon: Crown,
    label: 'Top 1%',
    color: 'bg-yellow-500 text-black',
    borderColor: 'border-yellow-300',
    show: true
  },
  top_5_percent: {
    icon: Trophy,
    label: 'Top 5%',
    color: 'bg-orange-600 text-white',
    borderColor: 'border-orange-400',
    show: true
  },
  top_10_percent: {
    icon: Star,
    label: 'Top 10%',
    color: 'bg-green-600 text-white',
    borderColor: 'border-green-400',
    show: true
  },
  rising_star: {
    icon: Zap,
    label: 'Rising Star',
    color: 'bg-pink-600 text-white',
    borderColor: 'border-pink-400',
    show: true
  },
  legendary: {
    icon: Shield,
    label: 'Legendary',
    color: 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white',
    borderColor: 'border-yellow-300',
    show: true
  }
};

const sizeConfig = {
  xs: {
    container: 'px-1.5 py-0.5 text-xs',
    icon: 'h-3 w-3',
    gap: 'gap-1'
  },
  sm: {
    container: 'px-2 py-1 text-xs',
    icon: 'h-3 w-3',
    gap: 'gap-1'
  },
  md: {
    container: 'px-3 py-1.5 text-sm',
    icon: 'h-4 w-4',
    gap: 'gap-1.5'
  },
  lg: {
    container: 'px-4 py-2 text-base',
    icon: 'h-5 w-5',
    gap: 'gap-2'
  }
};

const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'sm',
  showText = true,
  frozen = false,
  className = ''
}) => {
  const config = tierConfig[tier];
  const sizeStyles = sizeConfig[size];

  // Don't render standard tier badges
  if (!config.show) {
    return null;
  }

  const Icon = config.icon;

  return (
    <div
      className={`
        relative inline-flex items-center ${sizeStyles.gap} ${sizeStyles.container}
        ${config.color} ${config.borderColor}
        border rounded-full font-medium
        shadow-sm backdrop-blur-sm
        ${className}
      `}
      style={{ opacity: frozen ? 0.7 : 1 }}
      title={config.label}
    >
      {Icon && <Icon className={sizeStyles.icon} />}
      {showText && <span>{config.label}</span>}
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
    </div>
  );
};

export default TierBadge;
export { TierBadge };
