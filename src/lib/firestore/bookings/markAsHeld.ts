import admin from '@/lib/firebase-admin';

export async function markAsHeld(bookingId: string) {
  await admin.firestore().collection('bookings').doc(bookingId).update({
    paymentStatus: 'held',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
