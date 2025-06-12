import * as admin from 'firebase-admin';

export async function markAsHeld(bookingId: string) {
  await admin.firestore().doc(`bookings/${bookingId}`).update({ payoutStatus: 'held' });
}
