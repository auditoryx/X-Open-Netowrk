import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const getAllCreators = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
};
