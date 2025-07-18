'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { Booking } from '@/src/types/booking';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const time = searchParams?.get('time') || null;
  const location = searchParams?.get('location') || null;
  const fee = searchParams?.get('fee') || null;
  const router = useRouter();

  // Create a booking object for the confirmation component
  const createBookingFromParams = (): Booking => {
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: bookingId,
      clientId: 'current-user', // Would be actual user ID in real app
      providerId: 'provider-id', // Would be actual provider ID
      serviceId: 'service-id',   // Would be actual service ID
      serviceName: 'Music Production Session', // Default service name
      datetime: time || new Date().toISOString(),
      status: 'pending',
      title: 'Booking Request',
      notes: searchParams?.get('message') || undefined,
      createdAt: new Date().toISOString(),
      contract: {
        terms: 'Standard booking terms apply',
        agreedByClient: true,
        agreedByProvider: false
      }
    };
  };

  const booking = createBookingFromParams();

  const handleViewBooking = () => {
    router.push('/dashboard/bookings');
  };

  const handleMessageProvider = () => {
    router.push('/dashboard/messages');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <BookingConfirmation
        booking={booking}
        onViewBooking={handleViewBooking}
        onMessageProvider={handleMessageProvider}
        onBackToDashboard={handleBackToDashboard}
      />
    </div>
  );
}

  let formattedTime = null;
  if (time) {
    try {
      const parsed = parseISO(time);
      formattedTime = format(parsed, 'EEEE, MMMM d @ h:mm a');
    } catch {
      formattedTime = time;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">✅ Booking Request Sent!</h1>

        <p className="text-lg mb-2">
          {formattedTime ? (
            <>Your request is locked in for <span className="font-semibold text-green-400">{formattedTime}</span>.</>
          ) : (
            <>Your request has been submitted.</>
          )}
        </p>

        {location && (
          <p className="text-sm text-gray-400 mb-1">📍 Location: {location}</p>
        )}

        {fee && (
          <p className="text-sm text-gray-400 mb-4">
            💸 Platform fee: <span className="text-white font-semibold">${fee}</span>
          </p>
        )}

        <p className="text-sm text-gray-500 mb-8">
          You’ll receive a confirmation email shortly.
        </p>

        <div className="flex flex-col gap-2 items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="border border-white px-4 py-2 rounded hover:bg-white hover:text-black"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push('/explore')}
            className="text-sm underline text-gray-300 hover:text-white"
          >
            Explore More Creators
          </button>
        </div>
      </div>
    </div>
  );
}
