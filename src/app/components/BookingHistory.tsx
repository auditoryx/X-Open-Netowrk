'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';

interface Booking {
  id: string;
  serviceName: string;
  providerName: string;
  date: string;
  userId: string;
}

interface BookingHistoryProps {
  userId: string;
}

export default function BookingHistory({ userId }: BookingHistoryProps): JSX.Element {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadMore = useCallback(async (): Promise<void> => {
    setLoading(true);
    const base = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(10)
    );
    const q = lastDoc ? query(base, startAfter(lastDoc)) : base;
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || lastDoc);
    setBookings((prev) => [...prev, ...results]);
    setLoading(false);
  }, [lastDoc, userId]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Your Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <ul className="space-y-2">
          {bookings.map((booking) => (
            <li key={booking.id} className="border p-3 rounded bg-white text-black">
              <strong>{booking.serviceName}</strong> with {booking.providerName} <br />
              <span className="text-sm">Date: {booking.date}</span>
            </li>
          ))}
        </ul>
      )}
      {lastDoc && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-2 px-4 py-2 bg-gray-800 text-white rounded"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
