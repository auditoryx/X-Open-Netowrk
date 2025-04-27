import { db } from '@/lib/firebase/init';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendBookingConfirmation } from '@/functions/sendBookingConfirmation';
import { createNotification } from '@/lib/firestore/createNotification';

export async function createBooking(bookingData: any, clientEmail: string, clientId: string) {
  const bookingId = bookingData.id;
  const bookingRef = doc(db, 'bookings', bookingId);
  
  await setDoc(bookingRef, {
    ...bookingData,
    createdAt: serverTimestamp(),
    status: 'pending',
  });

  await sendBookingConfirmation(clientEmail, bookingId);
  await createNotification(clientId, 'booking_created', 'Your booking request has been sent!', bookingId);
}
