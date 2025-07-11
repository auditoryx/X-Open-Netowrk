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
import { SCHEMA_FIELDS } from '../../SCHEMA_FIELDS';

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
    const messageId = docRef[SCHEMA_FIELDS.MESSAGE_ID];
    const seen = docRef[SCHEMA_FIELDS.SEEN];
    
    await updateDoc(doc(db, 'bookings', bookingId, 'messages', docRef.id), {
      seenBy: [...(seen || []), uid]
    });
  }
}
