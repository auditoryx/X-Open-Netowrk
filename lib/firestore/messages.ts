import { db } from '@/firebase/firebaseConfig';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  updateDoc,
  limit,
  doc,
  getDoc
} from 'firebase/firestore';

export const sendMessage = async (
  bookingId: string,
  senderId: string,
  senderName: string,
  content: string,
  mediaUrl: string | null = null
) => {
  const ref = collection(db, 'bookings', bookingId, 'messages');
  const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
  if (!bookingSnap.exists()) return;
  const booking = bookingSnap.data() as any;

  await addDoc(ref, {
    senderId,
    senderName,
    content,
    mediaUrl,
    timestamp: serverTimestamp(),
    seen: false, // Keep for backwards compatibility
    seenBy: [senderId], // New: sender automatically sees their own message
    clientId: booking.clientId,
    providerId: booking.providerId,
  });
};

export const markMessagesAsSeen = async (bookingId: string, userId: string) => {
  const ref = collection(db, 'bookings', bookingId, 'messages');
  const q = query(ref, orderBy('timestamp', 'asc'), limit(50));
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
