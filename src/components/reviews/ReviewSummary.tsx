'use client';

import React, { useState } from 'react';
import { Star, TrendingUp, Users, BarChart3 } from 'lucide-react';
import RatingStars from './RatingStars';
import ReviewDisplay, { Review } from './ReviewDisplay';
import { ReviewList } from './ReviewList';
import useReviewAggregate from '@/hooks/useReviewAggregate';

interface ReviewSummaryProps {
  targetId: string;
  targetName?: string;
  showReviewList?: boolean;
  compact?: boolean;
  className?: string;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  targetId,
  targetName,
  showReviewList = true,
  compact = false,
  className = ''
}) => {
  const { data, loading, error } = useReviewAggregate(targetId);
  const [showDistribution, setShowDistribution] = useState(false);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        Error loading reviews: {error}
      </div>
    );
  }

  if (!data || !data.hasReviews) {
    return (
      <div className={`text-gray-500 text-center py-8 ${className}`}>
        <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p className="text-lg font-medium mb-1">No reviews yet</p>
        <p className="text-sm">Be the first to leave a review{targetName ? ` for ${targetName}` : ''}!</p>
      </div>
    );
  }

  const { averageRating, reviewCount, ratingDistribution } = data;

  const getRatingText = (rating: number | null) => {
    if (!rating) return 'No rating';
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Fair';
    return 'Poor';
  };

  return (
    <div className={className}>
      {/* Rating Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Customer Reviews{targetName ? ` for ${targetName}` : ''}
          </h3>
          
          {!compact && (
            <button
              onClick={() => setShowDistribution(!showDistribution)}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <BarChart3 className="w-4 h-4" />
              Details
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {averageRating?.toFixed(1) || '0.0'}
            </div>
            <RatingStars rating={averageRating || 0} size="md" />
            <div className="text-sm text-gray-600 mt-1">
              {getRatingText(averageRating)}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Users className="w-4 h-4" />
              <span>{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
            </div>
            
            {!compact && averageRating && averageRating > 4.0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>Highly rated</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating Distribution */}
        {showDistribution && !compact && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = ratingDistribution[rating] || 0;
                const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-8 text-gray-600">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-600 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Review List */}
      {showReviewList && (
        <ReviewList targetId={targetId} />
      )}
    </div>
  );
};

export default ReviewSummary;