'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import BookingChat from '@/components/booking/BookingChat';
import BookingChatTopBar from '@/components/booking/BookingChatTopBar';
import ContractViewer from '@/components/contract/ContractViewer';
import ReleaseFundsButton from '@/components/booking/ReleaseFundsButton';
import ReviewForm from '@/components/booking/ReviewForm';
import DisputeForm from '@/components/disputes/DisputeForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { listenToTyping } from '@/lib/firestore/chat/listenToTyping';

export default function BookingDetailPage() {
  const { bookingId: rawId } = useParams();
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const bookingId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '';
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
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

  useEffect(() => {
    if (!bookingId) return;
    const unsub = listenToTyping(bookingId, setTypingUsers);
    return () => unsub();
  }, [bookingId]);

  if (loading) return <div className="p-6 text-white">Loading booking...</div>;
  if (!booking) return <div className="p-6 text-white">Booking not found.</div>;

  const isClient = user?.uid === booking.buyerId;

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
        {success && (
          <div className="bg-green-600 text-white text-sm p-3 rounded mb-6">
            ✅ Booking Confirmed — you can now chat with your provider.
          </div>
        )}
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

            <BookingChatTopBar
              bookingId={bookingId}
              initialCount={booking.revisionsRemaining ?? 0}
              isClient={isClient}
            />
            <BookingChat bookingId={bookingId} />

            {typingUsers.length > 0 && (
              <p className="text-sm text-gray-400 italic">
                {typingUsers.join(', ')} is typing...
              </p>
            )}

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
