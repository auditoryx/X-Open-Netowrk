'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserBookings } from '@/lib/firestore/getUserBookings';
import { doc, updateDoc } from 'firebase/firestore';
// Update the import path below to the correct relative path where your firebaseConfig.ts is located.
// For example, if firebaseConfig.ts is in /workspaces/X-Open-Netowrk/firebase/firebaseConfig.ts, use:
import { db as firestore } from '../firebase/firebaseConfig';
// Or adjust the path as needed based on your project structure.
import toast from 'react-hot-toast';
import ContractViewer from '@/components/contract/ContractViewer';
import { agreeToContract } from '@/lib/firestore/contracts/agreeToContract';

export default function ClientBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviewText, setReviewText] = useState<{ [key: string]: string }>({});
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  const fetch = () => getUserBookings(user.uid, 'client').then(setBookings);

  useEffect(() => {
    if (user?.uid) fetch();
  }, [user]);

  const submitReview = async (bookingId: string) => {
    const text = reviewText[bookingId];
    const rating = ratings[bookingId];

    try {
      const bookingRef = doc(firestore, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        review: {
          text,
          rating,
          verified: true,
          createdAt: new Date().toISOString(),
        },
      });
      toast.success('Review submitted!');
      fetch();
    } catch (err) {
      toast.error('Failed to submit review.');
      console.error(err);
    }
  };

  const handleAgree = async (bookingId: string) => {
    await agreeToContract(bookingId, 'client', user.uid);
    toast.success('You agreed to the contract.');
    fetch();
  };

  return (
    <div>
      <h2 className='text-lg font-semibold mb-2'>Your Booking Requests</h2>
      {bookings.map((b) => (
        <div key={b.id} className='border p-3 rounded mb-4'>
          <p><strong>To:</strong> {b.providerId}</p>
          <p><strong>Service:</strong> {b.service}</p>
          <p><strong>Date:</strong> {b.dateTime}</p>
          <p><strong>Status:</strong> {b.status}</p>

          {b.contract && (
            <ContractViewer
              bookingId={b.id}
              terms={b.contract.terms}
              agreedByClient={b.contract.agreedByClient}
              agreedByProvider={b.contract.agreedByProvider}
              userRole='client'
              onAgree={() => handleAgree(b.id)}
            />
          )}

          {b.status === 'completed' && !b.review && (
            <div className='mt-4'>
              <label htmlFor={`rating-${b.id}`} className='block text-sm mb-1 text-white'>
                Rating (1–5 Stars)
              </label>
              <select
                id={`rating-${b.id}`}
                value={ratings[b.id] || ''}
                onChange={(e) =>
                  setRatings((prev) => ({ ...prev, [b.id]: parseInt(e.target.value) }))
                }
                className='w-full bg-gray-800 text-white p-2 rounded border border-gray-600'
              >
                <option value='' disabled>Select Rating</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                ))}
              </select>

              <textarea
                placeholder='Write your review here...'
                className='w-full mt-2 p-2 bg-gray-900 text-white border border-gray-700 rounded'
                value={reviewText[b.id] || ''}
                onChange={(e) =>
                  setReviewText((prev) => ({ ...prev, [b.id]: e.target.value }))
                }
              />
              <button
                onClick={() => submitReview(b.id)}
                className='mt-2 px-3 py-1 bg-green-600 text-white rounded'
              >
                Submit Review
              </button>
            </div>
          )}

          {b.review && (
            <div className='mt-2 p-2 bg-gray-800 rounded text-sm text-green-300'>
              <strong>Your Review:</strong> {b.review.text} — ⭐ {b.review.rating}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
