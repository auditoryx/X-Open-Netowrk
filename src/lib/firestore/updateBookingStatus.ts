import { db } from '@/lib/firebase/init';
import { doc, updateDoc } from 'firebase/firestore';

export async function updateBookingStatus(bookingId: string, status: string) {
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    status: status,
    updatedAt: new Date(),
  });
}
