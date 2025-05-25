'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/app/components/Navbar';
import BookingChat from '@/components/chat/BookingChat';
import ContractViewer from '@/components/contract/ContractViewer';
import ReleaseFundsButton from '@/components/booking/ReleaseFundsButton';
import ReviewForm from '@/components/booking/ReviewForm';
import DisputeForm from '@/components/disputes/DisputeForm';
import { useAuth } from '@/lib/hooks/useAuth';

export default function BookingDetailPage() {
  const { bookingId: rawId } = useParams();
  const bookingId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '';
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      const snap = await getDoc(doc(db, 'bookings', bookingId));
      if (snap.exists()) {
        setBooking(snap.data());
      }
      setLoading(false);
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="p-6 text-white">Loading booking...</div>;
  if (!booking) return <div className="p-6 text-white">Booking not found.</div>;

  const isClient = user?.uid === booking.buyerId;
  const isProvider = user?.uid === booking.providerId;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
        <h1 className="text-3xl font-bold">Booking Details</h1>

        <p><strong>Status:</strong> {booking.status}</p>
        <p><strong>Service ID:</strong> {booking.serviceId}</p>
        <p><strong>Buyer:</strong> {booking.buyerId}</p>
        <p><strong>Provider:</strong> {booking.providerId}</p>

        {booking.status === 'paid' && (
          <>
            <ContractViewer
              bookingId={bookingId}
              terms={booking.contract?.terms || 'No contract terms'}
              agreedByClient={booking.contract?.agreedByClient || false}
              agreedByProvider={booking.contract?.agreedByProvider || false}
              userRole={isClient ? 'client' : 'provider'}
              onAgree={async () => {
                await fetch('/api/agree-contract', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    bookingId,
                    role: isClient ? 'client' : 'provider',
                  }),
                });
                alert('✅ Contract signed!');
              }}
            />

            <BookingChat bookingId={bookingId} />
            <ReleaseFundsButton bookingId={bookingId} />
          </>
        )}

        {booking.status === 'completed' && (
          <>
            <ReviewForm
              bookingId={bookingId}
              providerId={booking.providerId}
              contractId={booking.contractId}
            />
            <DisputeForm
              bookingId={bookingId}
              clientId={booking.buyerId}
            />
          </>
        )}
      </div>
    </div>
  );
}
