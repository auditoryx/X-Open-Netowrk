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
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-8 text-center">
      {/* Success Icon */}
      <div className="mb-6">
        <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 px-2">
          Your booking has been successfully created and the provider has been notified.
        </p>
      </div>

      {/* Booking Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-3 text-center sm:text-left">Booking Details</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-gray-600 font-medium">Service:</span>
            <span className="font-medium text-gray-900">{booking.serviceName}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-gray-600 font-medium">Date:</span>
            <span className="font-medium text-gray-900">{date}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-gray-600 font-medium">Time:</span>
            <span className="font-medium text-gray-900">{time}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-gray-600 font-medium">Status:</span>
            <span className={`font-medium capitalize inline-block px-2 py-1 rounded-full text-xs ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {booking.status}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-gray-600 font-medium">Booking ID:</span>
            <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded truncate">{booking.id}</span>
          </div>
        </div>

        {booking.notes && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <span className="text-gray-600 text-sm font-medium">Notes:</span>
            <p className="text-sm text-gray-900 mt-2 bg-white p-3 rounded border">{booking.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {onViewBooking && (
          <button
            onClick={onViewBooking}
            className="w-full btn btn-primary flex items-center justify-center gap-2 py-3"
          >
            <Eye className="w-4 h-4" />
            View Booking
          </button>
        )}

        {onMessageProvider && (
          <button
            onClick={onMessageProvider}
            className="w-full btn btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <MessageSquare className="w-4 h-4" />
            Message Provider
          </button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => window.open('/calendar', '_blank')}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-2 py-3"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Add to Calendar</span>
            <span className="sm:hidden">Calendar</span>
          </button>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 py-3"
            >
              Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-6 text-left bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-center sm:text-left">What happens next?</h4>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>You'll receive a confirmation email with all details</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>The provider will review and confirm your booking</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>You can message the provider directly through our platform</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Payment will be processed according to the agreed terms</span>
          </li>
        </ul>
      </div>
    </div>
  );
}