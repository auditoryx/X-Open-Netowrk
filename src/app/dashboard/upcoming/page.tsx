'use client';

import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';

export default function UpcomingBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) return;
      const db = getFirestore(app);
      const ref = collection(db, 'bookings');
      const q = query(
        ref,
        where(SCHEMA_FIELDS.BOOKING.PROVIDER_ID, '==', user.uid),
        where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'pending'),
        orderBy('dateTime', 'asc')
      );
      const snap = await getDocs(q);
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };

    fetchBookings();
  }, [user]);

  if (!user) return <div className="p-6 text-white">You must be logged in.</div>;
  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">📅 Upcoming Bookings</h1>
        {bookings.length === 0 ? (
          <p>No upcoming requests.</p>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b) => (
              <li key={b.id} className="border p-4 rounded">
                <p><strong>Client ID:</strong> {b.clientId}</p>
                <p><strong>Time Slot:</strong> {b.dateTime}</p>
                <p><strong>Message:</strong> {b.message}</p>
                {b.providerLocation && (
                  <p><strong>📍 Location:</strong> {b.providerLocation}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
