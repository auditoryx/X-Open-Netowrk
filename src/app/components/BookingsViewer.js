'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, orderBy, startAfter, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export default function BookingsViewer() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [uidState, setUid] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      setUid(user.uid);
      await loadMore(user.uid);
    });

    return () => unsubscribe();
  }, []);

  const loadMore = async (uid) => {
    setLoading(true);
      const db = getFirestore(app);
      const base = query(
        collection(db, 'bookings'),
        where('providerId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
    const q = lastDoc ? query(base, startAfter(lastDoc)) : base;
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || lastDoc);
    setBookings((prev) => [...prev, ...results]);
    setLoading(false);
  };

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
          onClick={() => loadMore(uidState)}
          disabled={loading}
          className="mt-2 px-4 py-2 bg-gray-800 text-white rounded"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
