'use client';

import BookingChat from '../../../../components/chat/BookingChat';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ContractViewer from '@/components/contract/ContractViewer';
import ReleaseFundsButton from '@/components/booking/ReleaseFundsButton';
import ReviewForm from '@/components/booking/ReviewForm';
import DisputeForm from '@/components/disputes/DisputeForm';
import { useAuth } from '@/lib/hooks/useAuth';

export default function DashboardBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const highlightRef = useRef<{ [key: string]: HTMLLIElement | null }>({});

  useEffect(() => {
    const fetchBookings = async () => {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data);
      setLoading(false);
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    const targetId = searchParams?.get('bookingId');
    if (targetId && highlightRef.current[targetId]) {
      setTimeout(() => {
        highlightRef.current[targetId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [bookings, searchParams]);

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch('/api/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
  };

  const getStatusBanner = (status: string) => {
    const base = 'rounded p-3 mb-4 text-sm font-medium';
    switch (status) {
      case 'pending':
        return <div className={`${base} bg-blue-900 text-blue-200`}>⏳ Waiting for provider to respond.</div>;
      case 'accepted':
        return <div className={`${base} bg-yellow-900 text-yellow-200`}>💳 Request accepted. Awaiting your payment.</div>;
      case 'paid':
        return <div className={`${base} bg-green-900 text-green-200`}>✅ Session confirmed. Chat and deliverables unlocked below.</div>;
      case 'rejected':
        return <div className={`${base} bg-red-900 text-red-300`}>❌ This request was declined.</div>;
      default:
        return null;
    }
  };

  if (loading) return <div className="p-6 text-white">Loading bookings...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map(booking => (
            <li
              key={booking.id}
              ref={el => {
                highlightRef.current[booking.id] = el;
              }}
              className="border border-white p-4 rounded"
            >
              <p><strong>Service:</strong> {booking.serviceId}</p>
              <p><strong>Buyer:</strong> {booking.buyerId}</p>
              <p><strong>Status:</strong> {booking.status}</p>

              {booking.platformFee && (
                <p><strong>Platform Fee:</strong> ${booking.platformFee}</p>
              )}

              <div className="mt-4">
                {getStatusBanner(booking.status)}
              </div>

              {booking.status === 'paid' && (
                <>
                  <div className="mt-4">
                    <BookingChat bookingId={booking.id} />
                  </div>
                  <div className="mt-4">
                    <ContractViewer
                      bookingId={booking.id}
                      terms={booking.contract?.terms || 'By booking this service, both parties agree to the provided scope of work.'}
                    />
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
