import { markAsReleased } from '@/lib/firestore/bookings/markAsReleased';
import admin from '@/lib/firebase-admin';

export async function checkDisputeAndRelease(bookingId: string) {
  const doc = await admin.firestore().collection('disputes').doc(bookingId).get();
  const dispute = doc.data();

  if (!dispute || dispute.status === 'resolved') {
    await markAsReleased(bookingId);
  }
}
