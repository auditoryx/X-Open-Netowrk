'use client';
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';

interface ClientBooking {
  id: string;
  serviceName: string;
  price: number;
  status: string;
  providerId: string;
  clientId: string;
}

export default function ClientBookings(): JSX.Element {
  const [bookings, setBookings] = useState<ClientBooking[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where(SCHEMA_FIELDS.BOOKING.CLIENT_ID, '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ClientBooking[];
      setBookings(data);
    });

    return () => unsubscribe();
  }, []);

  if (!bookings.length) return <p>You haven't made any bookings yet.</p>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-2">Your Bookings</h2>
      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="border border-gray-600 p-4 rounded text-white"
          >
            <p><strong>Service:</strong> {booking.serviceName}</p>
            <p><strong>Price:</strong> ${booking.price}</p>
            <p><strong>Status:</strong> {booking.status}</p>
            <p><strong>Provider ID:</strong> {booking.providerId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}