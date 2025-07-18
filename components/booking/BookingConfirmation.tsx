'use client';

import React from 'react';
import { CheckCircleIcon, MessageSquare, Eye, Calendar } from 'lucide-react';
import { Booking } from '@/src/types/booking';

interface BookingConfirmationProps {
  booking: Booking;
  onViewBooking?: () => void;
  onMessageProvider?: () => void;
  onBackToDashboard?: () => void;
}

export default function BookingConfirmation({
  booking,
  onViewBooking,
  onMessageProvider,
  onBackToDashboard
}: BookingConfirmationProps) {
  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const { date, time } = formatDateTime(booking.datetime);

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
      {/* Success Icon */}
      <div className="mb-6">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-gray-600">
          Your booking has been successfully created and the provider has been notified.
        </p>
      </div>

      {/* Booking Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium">{booking.serviceName}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{date}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{time}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium capitalize ${
              booking.status === 'confirmed' ? 'text-green-600' : 
              booking.status === 'pending' ? 'text-yellow-600' : 
              'text-gray-600'
            }`}>
              {booking.status}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Booking ID:</span>
            <span className="font-medium text-xs">{booking.id}</span>
          </div>
        </div>

        {booking.notes && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-gray-600 text-sm">Notes:</span>
            <p className="text-sm text-gray-900 mt-1">{booking.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {onViewBooking && (
          <button
            onClick={onViewBooking}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Booking
          </button>
        )}

        {onMessageProvider && (
          <button
            onClick={onMessageProvider}
            className="w-full btn btn-secondary flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Message Provider
          </button>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => window.open('/calendar', '_blank')}
            className="flex-1 btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </button>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex-1 btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-6 text-left">
        <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• You'll receive a confirmation email with all details</li>
          <li>• The provider will review and confirm your booking</li>
          <li>• You can message the provider directly through our platform</li>
          <li>• Payment will be processed according to the agreed terms</li>
        </ul>
      </div>
    </div>
  );
}