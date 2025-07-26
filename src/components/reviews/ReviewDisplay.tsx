'use client';

import React from 'react';
import { User, Calendar } from 'lucide-react';
import RatingStars from './RatingStars';

export interface Review {
  id?: string;
  authorId: string;
  targetId: string;
  bookingId: string;
  rating: number;
  text: string;
  createdAt: any; // Firestore Timestamp
  authorName?: string;
  authorAvatar?: string;
  serviceTitle?: string;
}

interface ReviewDisplayProps {
  review: Review;
  showAuthor?: boolean;
  showService?: boolean;
  compact?: boolean;
  className?: string;
}

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  review,
  showAuthor = true,
  showService = false,
  compact = false,
  className = ''
}) => {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      // Handle Firestore Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {showAuthor && (
            <div className="flex items-center gap-2">
              {review.authorAvatar ? (
                <img
                  src={review.authorAvatar}
                  alt={review.authorName || 'Reviewer'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  {review.authorName ? (
                    <span className="text-xs font-medium text-gray-600">
                      {getInitials(review.authorName)}
                    </span>
                  ) : (
                    <User className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              )}
              <span className="text-sm font-medium text-gray-900">
                {review.authorName || 'Anonymous User'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          {formatDate(review.createdAt)}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-3">
        <RatingStars rating={review.rating} size="sm" showValue />
      </div>

      {/* Service info */}
      {showService && review.serviceTitle && (
        <div className="mb-3 p-2 bg-gray-50 rounded">
          <span className="text-xs font-medium text-gray-600">Service: </span>
          <span className="text-xs text-gray-800">{review.serviceTitle}</span>
        </div>
      )}

      {/* Review text */}
      <div className={compact ? 'text-sm' : 'text-base'}>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {review.text}
        </p>
      </div>

      {/* Metadata */}
      {!compact && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Booking ID: {review.bookingId.slice(-8)}</span>
            {review.id && (
              <span>Review ID: {review.id.slice(-8)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewDisplay;