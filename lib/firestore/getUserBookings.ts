import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@lib/firebase/init';

export const getUserBookings = async (uid: string, type: 'client' | 'provider') => {
  const bookingsRef = collection(firestore, 'bookings');
  const q = query(bookingsRef, where(`${type}Id`, '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
