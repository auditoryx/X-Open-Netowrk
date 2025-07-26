'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onRatingChange,
  className = ''
}) => {
  const [hoveredRating, setHoveredRating] = React.useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoveredRating(starRating);
    }
  };

  const handleStarLeave = () => {
    if (interactive) {
      setHoveredRating(0);
    }
  };

  const displayRating = interactive ? (hoveredRating || rating) : rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isPartiallyFilled = !isFilled && starValue - 0.5 <= displayRating;

          return (
            <div key={index} className="relative">
              {interactive ? (
                <button
                  type="button"
                  onClick={() => handleStarClick(starValue)}
                  onMouseEnter={() => handleStarHover(starValue)}
                  onMouseLeave={handleStarLeave}
                  className="p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  <Star
                    className={`${sizeClasses[size]} transition-colors ${
                      isFilled
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ) : (
                <Star
                  className={`${sizeClasses[size]} ${
                    isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              )}
              
              {/* Partial star overlay */}
              {isPartiallyFilled && !interactive && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${Math.min((displayRating - (starValue - 1)) * 100, 100)}%` }}
                >
                  <Star
                    className={`${sizeClasses[size]} text-yellow-400 fill-current`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-sm text-gray-600 ml-2">
          {displayRating.toFixed(1)} / {maxRating}
        </span>
      )}
    </div>
  );
};

export default RatingStars;