import React from 'react';

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  showDetails?: boolean;
  variant?: 'creator' | 'service' | 'booking';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  showImage = true,
  showDetails = true,
  variant = 'creator'
}) => {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse ${className}`}>
      {/* Image placeholder */}
      {showImage && (
        <div className="w-full h-32 bg-gray-700 rounded-lg mb-4"></div>
      )}

      {/* Content based on variant */}
      {variant === 'creator' && (
        <>
          {/* Name */}
          <div className="h-5 bg-gray-700 rounded mb-2"></div>
          
          {/* Tagline */}
          <div className="h-3 bg-gray-700 rounded mb-3 w-4/5"></div>
          
          {/* Location and rating */}
          <div className="flex justify-between items-center mb-3">
            <div className="h-3 bg-gray-700 rounded w-1/3"></div>
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
          </div>
          
          {/* Price and tier */}
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-6 bg-gray-700 rounded-full w-16"></div>
          </div>
        </>
      )}

      {variant === 'service' && (
        <>
          {/* Service title */}
          <div className="h-5 bg-gray-700 rounded mb-2"></div>
          
          {/* Description */}
          <div className="space-y-2 mb-3">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          </div>
          
          {/* Price and category */}
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-6 bg-gray-700 rounded w-20"></div>
          </div>
        </>
      )}

      {variant === 'booking' && (
        <>
          {/* Booking title */}
          <div className="h-5 bg-gray-700 rounded mb-2"></div>
          
          {/* Creator info */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            <div className="h-3 bg-gray-700 rounded w-1/3"></div>
          </div>
          
          {/* Status and date */}
          <div className="flex justify-between items-center mb-3">
            <div className="h-6 bg-gray-700 rounded-full w-20"></div>
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
          </div>
          
          {/* Price */}
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </>
      )}

      {/* Additional details */}
      {showDetails && variant === 'creator' && (
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-700 rounded-full w-12"></div>
            <div className="h-6 bg-gray-700 rounded-full w-16"></div>
            <div className="h-6 bg-gray-700 rounded-full w-14"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkeletonCard;
export { SkeletonCard };
