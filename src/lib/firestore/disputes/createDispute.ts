import { db } from '@/lib/firebase/init';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendDisputeEmail } from '@/functions/sendDisputeEmail';
import { createNotification } from '@/lib/firestore/createNotification';

export async function createDispute(disputeData: any, clientEmail: string, clientId: string) {
  const disputesRef = collection(db, 'disputes');
  const docRef = await addDoc(disputesRef, {
    ...disputeData,
    createdAt: serverTimestamp(),
    status: 'open',
  });

  await sendDisputeEmail(clientEmail, docRef.id);
  await createNotification(clientId, 'dispute_opened', 'You have opened a dispute.', docRef.id);
}

// Top of file:
import { logActivity } from '@/lib/firestore/logging/logActivity';

...

// After dispute is created:
await logActivity(dispute.userId, 'dispute_opened', {
  bookingId: dispute.bookingId,
  reason: dispute.reason,
});
