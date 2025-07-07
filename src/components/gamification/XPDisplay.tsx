import React from 'react';
import { Zap, TrendingUp, Award } from 'lucide-react';

interface XPDisplayProps {
  totalXP: number;
  dailyXP: number;
  dailyCapRemaining: number;
  tier: 'standard' | 'verified' | 'signature';
  className?: string;
  showDetails?: boolean;
}

const XPDisplay: React.FC<XPDisplayProps> = ({
  totalXP,
  dailyXP,
  dailyCapRemaining,
  tier,
  className = '',
  showDetails = true
}) => {
  const dailyCapTotal = 300; // Daily XP cap as per blueprint
  const dailyProgress = ((dailyCapTotal - dailyCapRemaining) / dailyCapTotal) * 100;

  const tierColors = {
    standard: 'text-gray-400',
    verified: 'text-blue-400', 
    signature: 'text-purple-400'
  };

  const tierLabels = {
    standard: 'Standard',
    verified: 'Verified',
    signature: 'Signature'
  };

  return (
    <div className={`bg-neutral-800 border border-neutral-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          <h3 className="font-semibold text-white">Experience Points</h3>
        </div>
        <div className="flex items-center gap-1">
          <Award className={`h-4 w-4 ${tierColors[tier]}`} />
          <span className={`text-sm font-medium ${tierColors[tier]}`}>
            {tierLabels[tier]}
          </span>
        </div>
      </div>

      {/* Total XP Display */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalXP.toLocaleString()}</span>
            <span className="text-sm text-gray-400">XP</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-400 mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>+{dailyXP} today</span>
          </div>
        </div>
      </div>

      {/* Daily Progress Details */}
      {showDetails && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Daily Progress</span>
            <span className="text-white">{dailyXP}/{dailyCapTotal} XP</span>
          </div>
          
          {/* Daily Progress Bar */}
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(dailyProgress, 100)}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {dailyCapRemaining > 0 ? `${dailyCapRemaining} XP remaining` : 'Daily cap reached'}
            </span>
            <span className="text-gray-500">
              {Math.round(dailyProgress)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default XPDisplay;
