import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export async function getNextAvailable(uid: string): Promise<string | null> {
  const db = getFirestore(app);
  const ref = doc(db, 'availability', uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const slots: string[] = snap.data().slots || [];

  if (!slots.length) return null;

  // Just return the first sorted slot for now
  const sorted = slots.sort(); // Assume slots are formatted like '14:00'
  return sorted[0]; // Later: add weekday support
}
