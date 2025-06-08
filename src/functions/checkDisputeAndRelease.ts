import { markAsReleased } from '@/lib/firestore/bookings/markAsReleased';
import { adminDb } from '@/lib/firebase-admin';

export async function checkDisputeAndRelease(bookingId: string) {
  const doc = await adminDb.collection('disputes').doc(bookingId).get();
  const dispute = doc.data();

  if (!dispute || dispute.status === 'resolved') {
    await markAsReleased({ bookingId, userId: 'system' });
  }
}
