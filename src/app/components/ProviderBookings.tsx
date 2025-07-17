'use client';
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';

interface ProviderBooking {
  id: string;
  clientId: string;
  serviceName: string;
  price: number;
  status: 'pending' | 'accepted' | 'declined';
  providerId: string;
}

export default function ProviderBookings(): JSX.Element {
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('providerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProviderBooking[];
      setBookings(data);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: 'accepted' | 'declined'): Promise<void> => {
    await updateDoc(doc(db, 'bookings', id), { status: newStatus });
  };

  if (!bookings.length) return <p>No bookings received yet.</p>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-2">Bookings You&apos;ve Received</h2>
      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="border border-gray-600 p-4 rounded text-white"
          >
            <p><strong>Customer ID:</strong> {booking.clientId}</p>
            <p><strong>Service:</strong> {booking.serviceName}</p>
            <p><strong>Price:</strong> ${booking.price}</p>
            <p><strong>Status:</strong> {booking.status}</p>

            {booking.status === 'pending' && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleStatusUpdate(booking.id, 'accepted')}
                  className="bg-green-500 px-3 py-1 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleStatusUpdate(booking.id, 'declined')}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  Decline
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <p>Welcome to the provider&apos;s booking page!</p>
      <p>You&apos;re not verified</p>
    </div>
  );
}