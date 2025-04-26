'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export default function BookingsViewer() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      const q = query(
        collection(db, 'bookings'),
        where('recipientUid', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(results);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
              <p><strong>From:</strong> {b.senderUid}</p>
              <p><strong>Message:</strong> {b.message}</p>
              <p><strong>Time Slot:</strong> {b.timeSlot}</p>
              <p><strong>Status:</strong> {b.status}</p>
              <p className="text-sm text-gray-400 mt-1">Submitted: {new Date(b.createdAt?.seconds * 1000).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
