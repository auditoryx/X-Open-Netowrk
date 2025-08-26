import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/init';

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}
