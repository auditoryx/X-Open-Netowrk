import { db } from '@/lib/firebase/init';
import { doc, updateDoc } from 'firebase/firestore';
import { sendBookingAccepted } from '@/functions/sendBookingAccepted';
import { sendReviewRequest } from '@/functions/sendReviewRequest';
import { createNotification } from '@/lib/firestore/createNotification';

export async function updateBookingStatus(bookingId: string, status: string, clientEmail?: string, clientId?: string) {
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    status: status,
    updatedAt: new Date(),
  });

  if (status === 'accepted' && clientEmail && clientId) {
    await sendBookingAccepted(clientEmail, bookingId);
    await createNotification(clientId, 'booking_accepted', 'Your booking has been accepted!', bookingId);
  }

  if (status === 'completed' && clientEmail && clientId) {
    await sendReviewRequest(clientEmail, bookingId);
    await createNotification(clientId, 'booking_completed', 'Please leave a review for your project!', bookingId);
  }
}
