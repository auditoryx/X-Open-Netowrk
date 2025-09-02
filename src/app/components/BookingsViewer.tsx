'use client';

import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, orderBy, startAfter, limit, DocumentSnapshot } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import React, { useEffect, useState, useCallback } from 'react';

interface BookingData {
  id: string;
  clientId: string;
  message: string;
  timeSlot: string;
  status: string;
  createdAt?: {
    seconds: number;
  };
}

export default function BookingsViewer() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [uidState, setUid] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      setUid(user.uid);
      await loadMore(user.uid);
    });

    return () => unsubscribe();
  }, []);

  const loadMore = useCallback(async (uid: string) => {
    setLoading(true);
    const base = query(
      collection(getFirestore(app), 'bookings'),
      where(SCHEMA_FIELDS.BOOKING.PROVIDER_ID, '==', uid),
      orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'),
      limit(10)
    );
    const q = lastDoc ? query(base, startAfter(lastDoc)) : base;
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as BookingData[];
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || lastDoc);
    setBookings((prev) => [...prev, ...results]);
    setLoading(false);
  }, [lastDoc]);

  useEffect(() => {
    if (uidState) {
      loadMore(uidState);
    }
  }, [uidState, loadMore]);

  if (loading) return <p className="text-white">Loading bookings...</p>;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-white">Incoming Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-400">No bookings yet.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="bg-gray-800 p-4 rounded shadow text-white">
              <p><strong>From:</strong> {b.clientId}</p>
              <p><strong>Message:</strong> {b.message}</p>
              <p><strong>Time Slot:</strong> {b.timeSlot}</p>
              <p><strong>Status:</strong> {b.status}</p>
              <p className="text-sm text-gray-400 mt-1">Submitted: {new Date(b.createdAt?.seconds * 1000).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
      {lastDoc && (
        <button
          onClick={() => loadMore(uidState!)}
          disabled={loading}
          className="mt-2 px-4 py-2 bg-gray-800 text-white rounded"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}