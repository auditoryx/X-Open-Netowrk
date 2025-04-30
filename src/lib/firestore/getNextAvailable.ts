import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

type Slot = { day: string; time: string };

export async function getNextAvailable(uid: string): Promise<string | null> {
  const db = getFirestore(app);
  const ref = doc(db, 'availability', uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const slots: Slot[] = snap.data().slots || [];

  if (!slots.length) return null;

  // Sort alphabetically by day then time
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sorted = slots.sort((a, b) => {
    const dayDiff = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
    return dayDiff !== 0 ? dayDiff : a.time.localeCompare(b.time);
  });

  return `${sorted[0].day.slice(0, 3)} @ ${sorted[0].time}`;
}
