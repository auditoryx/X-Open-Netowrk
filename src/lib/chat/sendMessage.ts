import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/init';

export async function sendMessage(input: {
  bookingId: string; senderId: string; senderName: string; content: string;
}) {
  await addDoc(collection(db, 'bookings', input.bookingId, 'messages'), {
    ...input,
    sentAt: serverTimestamp(),
    seen: false,
  });
}
