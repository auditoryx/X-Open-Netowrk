import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { sendDisputeEmail } from '@/lib/email/sendDisputeEmail';
import { logActivity } from '@/lib/firestore/logging/logActivity';

export async function createDispute({
  bookingId,
  fromUser,
  reason,
}: {
  bookingId: string;
  fromUser: string;
  reason: string;
}) {
  await addDoc(collection(db, 'disputes'), {
    bookingId,
    fromUser,
    reason,
    status: 'open',
    createdAt: Timestamp.now(),
  });

  await sendDisputeEmail(bookingId, fromUser, reason);

  await logActivity(fromUser, 'dispute_opened', {
    bookingId,
    reason,
  });
}
// This function creates a dispute in the Firestore database, sends an email notification about the dispute, and logs the activity.
// It takes an object with bookingId, fromUser, and reason as parameters.
// The dispute is added to the 'disputes' collection with a status of 'open' and a timestamp. 