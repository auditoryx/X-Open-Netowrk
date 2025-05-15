'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ContractViewer from '@/components/contract/ContractViewer';
import ReleaseFundsButton from '@/components/booking/ReleaseFundsButton';
import ReviewForm from '@/components/booking/ReviewForm';
import DisputeForm from '@/components/disputes/DisputeForm';

export default function DashboardBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
              className="border p-4 rounded"
            >
              <p><strong>Service:</strong> {booking.serviceId}</p>
              <p><strong>Buyer:</strong> {booking.buyerId}</p>
              <p><strong>Status:</strong> {booking.status}</p>

              {/* 💸 Fee Info */}
              {booking.platformFee && (
                <p><strong>Platform Fee:</strong> ${booking.platformFee}</p>
              )}

              {booking.status === 'paid' && (
                <div className="mt-4">
                  <ContractViewer bookingId={booking.id} terms={''} agreedByClient={false} agreedByProvider={false} userRole={'client'} onAgree={function (): void {
                    throw new Error('Function not implemented.');
                  } } />
                </div>
              )}

              <div className="flex space-x-4 mt-2">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                      className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                      className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>

              {booking.status === 'paid' && (
                <div className="mt-2">
                  <ReleaseFundsButton bookingId={booking.id} />
                </div>
              )}

              {booking.status === 'completed' && (
                <>
                  <p className="text-green-400 mt-2">Funds have been released to the provider.</p>

                  {!booking.hasReview && (
                    <div className="mt-4">
                      <ReviewForm
                        bookingId={booking.id}
                        providerId={booking.providerId}
                        contractId={booking.contractId}
                      />
                    </div>
                  )}

                  {!booking.hasDispute && (
                    <div className="mt-4">
                      <DisputeForm
                        bookingId={booking.id}
                        clientId={booking.buyerId}
                      />
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
