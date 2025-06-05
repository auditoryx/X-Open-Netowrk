import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

export async function markMessagesAsSeen(
  bookingId: string,
  uid: string
) {
  const db = getFirestore(app);
  const q = query(
    collection(db, 'bookings', bookingId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);

  const updates = snap.docs.filter(doc => {
    const data = doc.data();
    return !data.seenBy?.includes(uid);
  });

  for (const docRef of updates) {
    await updateDoc(doc(db, 'bookings', bookingId, 'messages', docRef.id), {
      seenBy: [...(docRef.data().seenBy || []), uid]
    });
  }
}
