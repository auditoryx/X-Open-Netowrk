'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { isFirebaseConfigured } from '@/lib/firebase';
import BookingSummary from '@/components/BookingSummary';
import { BookingType } from '@lib/pdf/generateContract';

export default function BookingPage() {
  // For demo, use a hardcoded bookingId. In real app, get from route params.
  const bookingId = 'demo-booking-id';
  const [bookingData, setBookingData] = useState<BookingType | null>(null);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      try {
        if (!isFirebaseConfigured()) {
          console.warn('Firebase not configured, using mock booking data');
          setBookingData({
            clientName: 'Mock Client',
            providerName: 'Mock Provider',
            serviceName: 'Mock Service',
            amount: 100,
            date: 'Mock Date',
            stripeSessionId: 'mock_session_id',
          });
          setLoading(false);
          return;
        }

        const ref = doc(db, 'bookings', bookingId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setBookingData({
            clientName: data.clientName,
            providerName: data.providerName,
            serviceName: data.serviceName,
            amount: data.amount,
            date: data.date,
            stripeSessionId: data.stripeSessionId,
          });
        } else {
          console.log('No booking found, using fallback data');
          setBookingData({
            clientName: 'Demo Client',
            providerName: 'Demo Provider',
            serviceName: 'Demo Service',
            amount: 50,
            date: 'Demo Date',
            stripeSessionId: 'demo_session_id',
          });
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
        setFirebaseError('Unable to load booking data');
        // Provide fallback data
        setBookingData({
          clientName: 'Fallback Client',
          providerName: 'Fallback Provider',
          serviceName: 'Fallback Service',
          amount: 0,
          date: 'Unavailable',
          stripeSessionId: 'fallback_session',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex flex-col items-center justify-center text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Loading Booking...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col items-center justify-center text-center p-8">
        {firebaseError && (
          <div className="bg-red-900 text-red-100 p-4 rounded-lg mb-4 max-w-md">
            ⚠️ {firebaseError}
          </div>
        )}
        
        {!isFirebaseConfigured() && (
          <div className="bg-blue-900 text-blue-100 p-4 rounded-lg mb-4 max-w-md">
            ℹ️ Running in development mode with mock data
          </div>
        )}

        <h1 className="text-4xl font-bold mb-4">Booking Overview</h1>
        <p className="text-lg text-gray-400">Manage your bookings easily from here.</p>
        {bookingData && <BookingSummary bookingData={bookingData} />}
        
        <button 
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
          data-testid="smoke"
        >
          Booking Actions
        </button>
      </div>
    </div>
  );
}
