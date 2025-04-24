import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/init';

export const updateBookingStatus = async (bookingId: string, newStatus: 'accepted' | 'rejected' | 'completed') => {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  await updateDoc(bookingRef, { status: newStatus });
};
