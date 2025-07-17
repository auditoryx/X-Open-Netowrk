'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { parseISO, format } from 'date-fns';
import { CheckCircleIcon, CalendarIcon, MessageCircleIcon, EyeIcon } from 'lucide-react';

interface BookingConfirmationProps {
  /** Selected booking time */
  time?: string | null;
  /** Provider/location information */
  location?: string | null;
  /** Platform fee amount */
  fee?: string | null;
  /** Provider ID for messaging and viewing */
  providerId?: string;
  /** Booking ID for direct booking access */
  bookingId?: string;
}

export default function BookingConfirmation({ 
  time, 
  location, 
  fee, 
  providerId,
  bookingId 
}: BookingConfirmationProps) {
  const router = useRouter();

  // Format the booking time
  let formattedTime = null;
  if (time) {
    try {
      const parsed = parseISO(time);
      formattedTime = format(parsed, 'EEEE, MMMM d @ h:mm a');
    } catch {
      formattedTime = time;
    }
  }

  const handleViewBooking = () => {
    if (bookingId) {
      router.push(`/dashboard/bookings/${bookingId}`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleMessageProvider = () => {
    if (providerId) {
      router.push(`/chat/${providerId}`);
    } else {
      router.push('/dashboard/messages');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-xl mx-auto p-6 md:p-8 text-center w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircleIcon className="w-16 h-16 md:w-20 md:h-20 text-green-400" />
        </div>

        {/* Main Success Message */}
        <h1 className="text-2xl md:text-4xl font-bold mb-4 text-green-400">
          🎉 Booking Request Sent!
        </h1>

        {/* Booking Details */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 space-y-3">
          {formattedTime && (
            <p className="text-lg mb-2">
              Your request is locked in for{' '}
              <span className="font-semibold text-green-400">{formattedTime}</span>
            </p>
          )}

          {location && (
            <div className="flex items-center justify-center text-sm text-gray-400">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span>📍 Location: {location}</span>
            </div>
          )}

          {fee && (
            <div className="text-sm text-gray-400">
              💸 Platform fee:{' '}
              <span className="text-white font-semibold">${fee}</span>
            </div>
          )}
        </div>

        {/* Status Information */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-2">
            You'll receive a confirmation email shortly.
          </p>
          <p className="text-sm text-gray-400">
            The provider will review your request and respond within 24 hours.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleViewBooking}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 md:px-6 rounded-lg font-medium transition-colors w-full sm:w-auto"
            >
              <EyeIcon className="w-4 h-4" />
              View Booking
            </button>
            
            {providerId && (
              <button
                onClick={handleMessageProvider}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 md:px-6 rounded-lg font-medium transition-colors w-full sm:w-auto"
              >
                <MessageCircleIcon className="w-4 h-4" />
                Message Provider
              </button>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition-colors w-full sm:w-auto"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/explore')}
              className="text-sm underline text-gray-300 hover:text-white transition-colors px-4 py-2 w-full sm:w-auto"
            >
              Explore More Creators
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-xs text-gray-500">
          <p>Need help? Visit our{' '}
            <button 
              onClick={() => router.push('/help')}
              className="underline hover:text-gray-300"
            >
              Help Center
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}