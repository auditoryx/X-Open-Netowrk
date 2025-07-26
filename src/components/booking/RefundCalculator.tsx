'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, Info, Calculator } from 'lucide-react';

interface RefundCalculatorProps {
  bookingId?: string;
  amount?: number;
  scheduledTime?: string;
  creatorTier?: 'standard' | 'verified' | 'signature';
  className?: string;
}

interface RefundDetails {
  canRefund: boolean;
  refund: {
    amount: number;
    percentage: number;
    processingFee: number;
  };
  timing: {
    hoursUntilBooking: number;
    reason: string;
  };
}

export default function RefundCalculator({
  bookingId,
  amount,
  scheduledTime,
  creatorTier = 'standard',
  className = ''
}: RefundCalculatorProps) {
  const [refundDetails, setRefundDetails] = useState<RefundDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      loadRefundDetails();
    }
  }, [bookingId]);

  const loadRefundDetails = async () => {
    if (!bookingId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/refund`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load refund details');
      }

      setRefundDetails(data);
    } catch (error) {
      console.error('Error loading refund details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load refund details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours < 1) return 'Less than 1 hour';
    if (hours < 24) return `${Math.floor(hours)} hours`;
    if (hours < 168) return `${Math.floor(hours / 24)} days`;
    return `${Math.floor(hours / 168)} weeks`;
  };

  const getTierPolicyText = (tier: string) => {
    const policies = {
      standard: 'Full refund 48+ hours before, 50% refund 24-48 hours before',
      verified: 'Full refund 72+ hours before, 75% refund 48-72 hours before, 25% refund 24-48 hours before',
      signature: 'Full refund 7+ days before, 75% refund 3-7 days before, 50% refund 2-3 days before, 10% refund 1-2 days before'
    };
    return policies[tier as keyof typeof policies] || policies.standard;
  };

  if (isLoading) {
    return (
      <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Calculating refund...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`border border-red-200 bg-red-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center text-red-700">
          <Info className="w-5 h-5 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!refundDetails && !amount) {
    return (
      <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center text-gray-500">
          <Calculator className="w-5 h-5 mr-2" />
          <span className="text-sm">No refund information available</span>
        </div>
      </div>
    );
  }

  const details = refundDetails || {
    canRefund: false,
    refund: { amount: 0, percentage: 0, processingFee: 0 },
    timing: { hoursUntilBooking: 0, reason: 'No booking details available' }
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <Calculator className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="font-medium text-gray-900">Refund Calculator</h3>
      </div>

      <div className="space-y-3">
        {/* Current Refund Amount */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Current Refund:</span>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${details.canRefund ? 'text-green-600' : 'text-red-600'}`}>
              ${details.refund.amount.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              {details.refund.percentage}% of booking amount
            </div>
          </div>
        </div>

        {/* Timing Information */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Time Remaining:</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {formatTimeRemaining(details.timing.hoursUntilBooking)}
            </div>
          </div>
        </div>

        {/* Fees */}
        {details.refund.processingFee > 0 && (
          <div className="text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Processing fee:</span>
              <span>-${details.refund.processingFee.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Status Message */}
        <div className={`p-3 rounded text-sm ${
          details.canRefund 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          {details.timing.reason}
        </div>

        {/* Policy Information */}
        <div className="border-t pt-3">
          <div className="flex items-start">
            <Info className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">
                {creatorTier.charAt(0).toUpperCase() + creatorTier.slice(1)} Creator Policy:
              </p>
              <p className="text-xs text-gray-600">
                {getTierPolicyText(creatorTier)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}