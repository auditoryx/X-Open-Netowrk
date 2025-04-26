'use client';

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function BookingHistory({ userId }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const q = query(collection(db, 'bookings'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(results);
    };

    fetchBookings();
  }, [userId]);

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
    </div>
  );
}
