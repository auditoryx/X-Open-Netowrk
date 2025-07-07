import React from 'react';
import { ChevronUp, Target } from 'lucide-react';

interface XPProgressBarProps {
  currentXP: number;
  targetXP: number;
  targetLabel: string;
  size?: 'sm' | 'md' | 'lg';
  showNumbers?: boolean;
  showTarget?: boolean;
  variant?: 'default' | 'tier' | 'daily';
  className?: string;
}

const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  targetXP,
  targetLabel,
  size = 'md',
  showNumbers = true,
  showTarget = true,
  variant = 'default',
  className = ''
}) => {
  const progress = Math.min((currentXP / targetXP) * 100, 100);
  const remaining = Math.max(targetXP - currentXP, 0);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3'
  };

  const gradients = {
    default: 'from-blue-400 to-blue-600',
    tier: 'from-purple-400 to-purple-600',
    daily: 'from-yellow-400 to-orange-400'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header with current progress */}
      {showNumbers && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">
              {currentXP.toLocaleString()} XP
            </span>
            {showTarget && (
              <div className="flex items-center gap-1 text-gray-400">
                <Target className="h-3 w-3" />
                <span>Goal: {targetXP.toLocaleString()}</span>
              </div>
            )}
          </div>
          {remaining > 0 && (
            <span className="text-gray-400">
              {remaining.toLocaleString()} to go
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="relative">
        <div className={`w-full bg-neutral-700 rounded-full ${sizeClasses[size]}`}>
          <div
            className={`bg-gradient-to-r ${gradients[variant]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out relative`}
            style={{ width: `${progress}%` }}
          >
            {/* Glow effect for completed progress */}
            {progress > 0 && (
              <div 
                className={`absolute inset-0 bg-gradient-to-r ${gradients[variant]} rounded-full opacity-50 blur-sm`}
              />
            )}
          </div>
        </div>
        
        {/* Progress percentage indicator */}
        {progress > 10 && (
          <div
            className="absolute top-0 flex items-center justify-center h-full pointer-events-none"
            style={{ left: `${Math.min(progress - 5, 90)}%` }}
          >
            <span className="text-xs font-medium text-white drop-shadow-lg">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* Target label and completion status */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{targetLabel}</span>
        {progress >= 100 ? (
          <div className="flex items-center gap-1 text-green-400">
            <ChevronUp className="h-3 w-3" />
            <span className="font-medium">Completed!</span>
          </div>
        ) : (
          <span className="text-gray-500">
            {Math.round(progress)}% complete
          </span>
        )}
      </div>
    </div>
  );
};

export default XPProgressBar;
