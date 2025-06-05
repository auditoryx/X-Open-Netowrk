import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useBookingData(bookingId?: string) {
  const [booking, setBooking] = useState<any | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    const unsubscribe = onSnapshot(doc(db, 'bookings', bookingId), snap => {
      setBooking(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => unsubscribe();
  }, [bookingId]);

  return booking;
}
