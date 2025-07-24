import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function setUserIntent(uid: string, intent: 'client' | 'provider' | 'both') {
  await setDoc(doc(db, 'users', uid), { userIntent: intent }, { merge: true });
}
