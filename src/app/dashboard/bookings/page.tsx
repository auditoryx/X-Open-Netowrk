'use client';

import BookingChat from '@/components/booking/BookingChat';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ContractViewer from '@/components/contract/ContractViewer';
import ReleaseFundsButton from '@/components/booking/ReleaseFundsButton';
import ReviewForm from '@/components/booking/ReviewForm';
import DisputeForm from '@/components/disputes/DisputeForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';
import { getUserBookings } from '@/lib/firestore/getUserBookings';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const highlightRef = useRef<{ [key: string]: HTMLLIElement | null }>({});

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) return;
      
      try {
        // Use client-side Firebase to get user bookings
        const data = await getUserBookings(user.uid, 'both', 20);
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]);
      }
      
      setLoading(false);
    };
    
    fetchBookings();
  }, [user]);

  useEffect(() => {
    const targetId = searchParams?.get(SCHEMA_FIELDS.REVIEW.BOOKING_ID);
    if (targetId && highlightRef.current[targetId]) {
      setTimeout(() => {
        highlightRef.current[targetId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [bookings, searchParams]);

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!user) return;
    
    try {
      // Update booking status directly in Firestore
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, { status });
      
      // Update local state
      setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
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

  const handleContractAgree = async (bookingId: string, role: 'client' | 'provider') => {
    await fetch('/api/agree-contract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, role }),
    });

    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              contract: {
                ...b.contract,
                agreedByClient: role === 'client' ? true : b.contract.agreedByClient,
                agreedByProvider: role === 'provider' ? true : b.contract.agreedByProvider,
              },
            }
          : b
      )
    );
  };

  if (loading) return <div className="p-6 text-white">Loading bookings...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>
      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-6">
          <h2 className="text-xl font-bold mb-2">📁 No bookings yet.</h2>
          <p className="text-gray-400 mb-4">Once you send a booking request, your messages will show up here.</p>
          <button
            onClick={() => router.push('/explore')}
            className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition"
          >
            🔍 Explore Creators
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {bookings.map(booking => {
            const userRole = user?.uid === booking.buyerId ? 'client' : 'provider';
            const contract = booking.contract || {};
            const bothAgreed = contract.agreedByClient && contract.agreedByProvider;

            return (
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

                {booking.status === 'pending' && user?.uid === booking.providerId && (
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                      className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                      className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}

                {booking.status === 'paid' && (
                  <>
                    <div className="mt-4">
                      <ContractViewer
                        bookingId={booking.id}
                        terms={contract.terms || 'By booking this service, both parties agree to the provided scope of work.'}
                        agreedByClient={contract.agreedByClient || false}
                        agreedByProvider={contract.agreedByProvider || false}
                        userRole={userRole}
                        onAgree={() => handleContractAgree(booking.id, userRole)}
                      />
                    </div>

                    {bothAgreed ? (
                      <div className="mt-4">
                        <BookingChat bookingId={booking.id} />
                      </div>
                    ) : (
                      <p className="text-yellow-400 text-sm font-medium">
                        ⚠️ Both parties must agree to the contract before messaging.
                      </p>
                    )}

                    {userRole === 'client' && (
                      <div className="mt-4">
                        <ReleaseFundsButton bookingId={booking.id} />
                      </div>
                    )}
                  </>
                )}

                {booking.status === 'completed' && user?.uid === booking.buyerId && (
                  <>
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
