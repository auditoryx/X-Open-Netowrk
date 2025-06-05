'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useBookingData } from '@/lib/hooks/useBookingData';
import BookingChat from '@/components/chat/BookingChat';

export default function PurchaseDetailPage() {
  const { bookingId: rawId } = useParams();
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const bookingId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '';

  const booking = useBookingData(bookingId);
  const loading = !booking;

  if (loading) return <div className="p-6 text-white">Loading booking...</div>;
  if (!booking) return <div className="p-6 text-white">Booking not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
        {success && (
          <div className="bg-green-600 text-white text-sm p-3 rounded mb-6">
            ✅ Booking Confirmed — you can now chat with your provider.
          </div>
        )}
        <h1 className="text-3xl font-bold">Purchase Details</h1>
        <p><strong>Status:</strong> {booking.status}</p>
        <p><strong>Service ID:</strong> {booking.serviceId}</p>
        <p><strong>Buyer:</strong> {booking.buyerId}</p>
        <p><strong>Provider:</strong> {booking.providerId}</p>
        <BookingChat bookingId={bookingId} />
      </div>
    </div>
  );
}
