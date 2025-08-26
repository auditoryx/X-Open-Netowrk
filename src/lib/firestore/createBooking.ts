import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/init';

export async function createBooking(input: {
  clientId: string; providerId: string; service: string;
  dateTime: string; message?: string;
}) {
  if (!db) throw new Error('Firestore not initialized');
  await addDoc(collection(db, 'bookings'), {
    ...input,
    createdAt: serverTimestamp(),
    status: 'pending',
  });
}
