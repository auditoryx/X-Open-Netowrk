'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, DollarSign, Clock, Info } from 'lucide-react';

interface RefundPreview {
  canCancel: boolean;
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

interface CancellationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingTitle: string;
  scheduledTime: string;
  onCancellationComplete: (result: any) => void;
}

export default function CancellationDialog({
  isOpen,
  onClose,
  bookingId,
  bookingTitle,
  scheduledTime,
  onCancellationComplete
}: CancellationDialogProps) {
  const [refundPreview, setRefundPreview] = useState<RefundPreview | null>(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load refund preview when dialog opens
  useEffect(() => {
    if (isOpen && bookingId) {
      loadRefundPreview();
    }
  }, [isOpen, bookingId]);

  const loadRefundPreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load refund preview');
      }

      setRefundPreview(data);
    } catch (error) {
      console.error('Error loading refund preview:', error);
      setError(error instanceof Error ? error.message : 'Failed to load refund preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancellation = async () => {
    if (!refundPreview?.canCancel) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reason.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      onCancellationComplete(data);
      onClose();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimeUntilBooking = (hours: number) => {
    if (hours < 1) return 'Less than 1 hour';
    if (hours < 24) return `${Math.floor(hours)} hours`;
    return `${Math.floor(hours / 24)} days`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Cancel Booking</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isProcessing}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Booking Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{bookingTitle}</h3>
            <p className="text-sm text-gray-600">
              Scheduled: {new Date(scheduledTime).toLocaleDateString()} at{' '}
              {new Date(scheduledTime).toLocaleTimeString()}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Loading refund details...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Refund Preview */}
          {refundPreview && !isLoading && (
            <div className="space-y-4">
              {/* Refund Details */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Refund Information</h4>
                </div>
                
                {refundPreview.canCancel ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Refund Amount:</span>
                      <span className="font-medium text-green-600">
                        ${refundPreview.refund.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Refund Percentage:</span>
                      <span className="font-medium">
                        {refundPreview.refund.percentage}%
                      </span>
                    </div>
                    {refundPreview.refund.processingFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Processing Fee:</span>
                        <span className="text-red-600">
                          -${refundPreview.refund.processingFee.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Cannot Cancel</p>
                      <p className="text-sm text-red-700">{refundPreview.timing.reason}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Timing Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Timing</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Time until booking: {formatTimeUntilBooking(refundPreview.timing.hoursUntilBooking)}
                </p>
              </div>

              {/* Cancellation Reason */}
              {refundPreview.canCancel && (
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Cancellation (Optional)
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Please let us know why you're cancelling..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {reason.length}/500 characters
                  </p>
                </div>
              )}

              {/* Policy Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Cancellation Policy</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Refund amounts are calculated based on the creator's tier and timing of cancellation.
                      Refunds typically process within 3-5 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              Keep Booking
            </button>
            {refundPreview?.canCancel && (
              <button
                onClick={handleCancellation}
                disabled={isProcessing || !refundPreview.canCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}