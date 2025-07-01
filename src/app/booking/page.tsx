'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import BookingSummary from '@/components/BookingSummary';
import { BookingType } from '@lib/pdf/generateContract';

export default function BookingPage() {
  // For demo, use a hardcoded bookingId. In real app, get from route params.
  const bookingId = 'demo-booking-id';
  const [bookingData, setBookingData] = useState<BookingType | null>(null);

  useEffect(() => {
    async function fetchBooking() {
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
      }
    }
    fetchBooking();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Booking Overview</h1>
        <p className="text-lg text-gray-400">Manage your bookings easily from here.</p>
        {bookingData && <BookingSummary bookingData={bookingData} />}
      </div>
    </div>
  );
}
