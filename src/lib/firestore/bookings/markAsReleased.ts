import admin from '@/lib/firebase-admin';

export async function markAsReleased(bookingId: string) {
  await admin.firestore().collection('bookings').doc(bookingId).update({
    paymentStatus: 'released',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
