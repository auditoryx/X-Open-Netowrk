"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import BookingSummary from '@/components/BookingSummary';
import { BookingType } from '@lib/pdf/generateContract';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    async function fetchBookingAndAuth() {
      if (!bookingId) return;
      try {
        const ref = doc(db, 'bookings', bookingId as string);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError('Booking not found.');
          setLoading(false);
          return;
        }
        const data = snap.data();
        // Validate all required fields
        if (!data.clientName || !data.providerName || !data.serviceTitle || !data.price || !data.stripeSessionId || !data.bookingDate) {
          setError('Booking data incomplete.');
          setLoading(false);
          return;
        }
        // Auth check
        const auth = getAuth();
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            setError('You must be signed in to view this contract.');
            setAuthorized(false);
            setLoading(false);
            return;
          }
          if (user.uid === data.clientUid || user.uid === data.providerUid) {
            setAuthorized(true);
            setBookingData({
              clientName: data.clientName,
              providerName: data.providerName,
              serviceTitle: data.serviceTitle,
              price: data.price,
              bookingDate: data.bookingDate,
              stripeSessionId: data.stripeSessionId,
            });
          } else {
            setError('You are not authorized to view this contract.');
            setAuthorized(false);
          }
          setLoading(false);
        });
      } catch (e) {
        setError('Error fetching booking.');
        setLoading(false);
      }
    }
    fetchBookingAndAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Booking Details</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {authorized && bookingData && (
        <div className="space-y-6">
          <BookingSummary bookingData={bookingData} />
          
          {/* Chat Link */}
          <div className="text-center">
            <button
              onClick={() => router.push(`/booking/${bookingId}/chat`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              💬 Open Chat
            </button>
            <p className="text-gray-400 text-sm mt-2">
              Communicate with the other party about this booking
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
