import { db } from '@/firebase/firebaseConfig';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  updateDoc
} from 'firebase/firestore';

export const sendMessage = async (
  bookingId: string,
  senderId: string,
  senderName: string,
  content: string,
  mediaUrl: string | null = null
) => {
  const ref = collection(db, 'bookings', bookingId, 'messages');
  await addDoc(ref, {
    senderId,
    senderName,
    content,
    mediaUrl,
    timestamp: serverTimestamp(),
    seen: false,
  });
};

export const markMessagesAsSeen = async (bookingId: string, userId: string) => {
  const ref = collection(db, 'bookings', bookingId, 'messages');
  const q = query(ref, orderBy('timestamp', 'asc'));
  const snapshot = await getDocs(q);
  snapshot.docs.forEach((docSnap) => {
    if (docSnap.data().senderId !== userId && !docSnap.data().seen) {
      updateDoc(docSnap.ref, { seen: true });
    }
  });
};

export const subscribeToMessages = (bookingId: string, callback: (msgs: any[]) => void) => {
  const ref = collection(db, 'bookings', bookingId, 'messages');
  const q = query(ref, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};
