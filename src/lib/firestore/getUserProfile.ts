import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    contactOnlyViaRequest: data.contactOnlyViaRequest ?? false,
  };
}
