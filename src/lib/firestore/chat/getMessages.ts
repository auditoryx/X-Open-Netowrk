import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentData
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

export function listenToMessages(
  bookingId: string,
  callback: (messages: DocumentData[]) => void
) {
  const db = getFirestore(app);
  const ref = collection(db, 'bookings', bookingId, 'messages');
  const q = query(ref, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data());
    callback(messages);
  });
}
