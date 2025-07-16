import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentData
} from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { SCHEMA_FIELDS } from '../../SCHEMA_FIELDS';

export function listenToMessages(
  bookingId: string,
  callback: (messages: DocumentData[]) => void
) {
  const db = getFirestore(app);
  const ref = collection(db, 'bookings', bookingId, 'messages');
  const q = query(ref, orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data());
    callback(messages);
  });
}

const messageId = doc[SCHEMA_FIELDS.MESSAGE_ID];
const seen = doc[SCHEMA_FIELDS.SEEN];
