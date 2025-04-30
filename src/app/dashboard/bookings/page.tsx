'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ContractViewer from '@/components/contract/ContractViewer';
import ReleaseFundsButton from '@/components/booking/ReleaseFundsButton';
import ReviewForm from '@/components/booking/ReviewForm'; // ✅ NEW

export default function DashboardBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBookings = async () => {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data);
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch('/api/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status } : b))
    );
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
            <li key={booking.id} className="border p-4 rounded">
              <p><strong>Service:</strong> {booking.serviceId}</p>
              <p><strong>Buyer:</strong> {booking.buyerId}</p>
              <p><strong>Status:</strong> {booking.status}</p>

              {/* 📄 Contract shown if paid */}
              {booking.status === 'paid' && (
                <div className="mt-4">
                  <ContractViewer bookingId={booking.id} />
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

              {/* 💸 Show Release Funds OR Confirmation */}
              {booking.status === 'paid' && (
                <div className="mt-2">
                  <ReleaseFundsButton bookingId={booking.id} />
                </div>
              )}
              {booking.status === 'completed' && (
                <>
                  <p className="text-green-400 mt-2">Funds have been released to the provider.</p>

                  {/* 📝 Show review form if not yet reviewed */}
                  {!booking.hasReview && (
                    <div className="mt-4">
                      <ReviewForm
                        onSubmit={async (review) => {
                          await fetch('/api/reviews', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              bookingId: booking.id,
                              reviewerId: booking.buyerId,
                              reviewedId: booking.providerId,
                              ...review,
                            }),
                          });
                          alert('Review submitted!');
                          // Optionally update UI here if needed
                        }}
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
// Note: The above code assumes you have a backend API set up to handle the requests made in the useEffect and button click handlers.
// The API endpoints should be implemented to handle the respective actions (fetching bookings, updating status, etc.).
// The ReviewForm component is a simple form that takes a callback function onSubmit to handle the review submission.
// The ContractViewer component is a simple viewer for the contract text.
// The ReleaseFundsButton component handles the release of funds to the provider.
// The code is structured to be modular and reusable, with clear separation of concerns for each component.