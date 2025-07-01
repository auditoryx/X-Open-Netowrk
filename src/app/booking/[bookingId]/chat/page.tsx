'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { useAuth } from '@/lib/hooks/useAuth';
import BookingChatThread from '@/components/BookingChatThread';

interface Booking {
  id: string;
  clientUid: string;
  providerUid: string;
  clientName?: string;
  providerName?: string;
  serviceName?: string;
  status: string;
  createdAt: any;
}

const BookingChatPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = params?.bookingId as string;

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('Booking ID not found');
        setLoading(false);
        return;
      }

      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
          setError('Booking not found');
          setLoading(false);
          return;
        }

        const bookingData = { id: bookingSnap.id, ...bookingSnap.data() } as Booking;
        setBooking(bookingData);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Check authorization after both user and booking are loaded
  useEffect(() => {
    if (!authLoading && !loading && user && booking) {
      const isAuthorized = user.uid === booking.clientUid || user.uid === booking.providerUid;
      
      if (!isAuthorized) {
        setError('You are not authorized to view this chat');
        return;
      }
    }
  }, [user, booking, authLoading, loading]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Require authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to access this chat</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Check if booking exists
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Booking not found</p>
        </div>
      </div>
    );
  }

  const isClient = user.uid === booking.clientUid;
  const otherParty = isClient ? booking.providerName || 'Provider' : booking.clientName || 'Client';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Booking
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Chat - {booking.serviceName || 'Booking'}
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Booking ID:</strong> {booking.id}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status}
                </span>
              </p>
              <p><strong>Chatting with:</strong> {otherParty}</p>
            </div>
          </div>
        </div>

        {/* Chat Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <BookingChatThread bookingId={bookingId} booking={booking} />
        </div>

        {/* Helper Text */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>This chat is secure and only accessible to you and {otherParty.toLowerCase()}.</p>
        </div>
      </div>
    </div>
  );
};

export default BookingChatPage;
