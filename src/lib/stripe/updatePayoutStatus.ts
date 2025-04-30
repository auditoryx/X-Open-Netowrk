import admin from '@/lib/firebase-admin';

export async function updatePayoutStatus(uid: string, bookingId: string) {
  await admin.firestore().collection('bookings').doc(bookingId).update({
    payoutStatus: 'paid',
    payoutTimestamp: Date.now(),
  });

  await admin.firestore().collection('users').doc(uid).update({
    lastPayout: Date.now(),
  });
}
