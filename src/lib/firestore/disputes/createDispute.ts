import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function createDispute({ bookingId, fromUser, reason }: {
  bookingId: string;
  fromUser: string;
  reason: string;
}) {
  return await addDoc(collection(db, 'disputes'), {
    bookingId,
    fromUser,
    reason,
    status: 'open',
    createdAt: Timestamp.now(),
  });
}
