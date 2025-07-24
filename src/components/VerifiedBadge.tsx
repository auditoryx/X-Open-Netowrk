import React from 'react';
import { CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  size = 'md', 
  className = '', 
  showText = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm', 
    lg: 'text-base'
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <CheckCircle 
        className={`${sizeClasses[size]} text-blue-500 flex-shrink-0`}
        aria-label="Verified"
      />
      {showText && (
        <span className={`text-blue-500 font-medium ${textSizeClasses[size]}`}>
          Verified
        </span>
      )}
    </div>
  );
};

export default VerifiedBadge;