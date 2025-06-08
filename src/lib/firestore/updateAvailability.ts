import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { getNextDateForWeekday } from '@/lib/google/utils';

/**
 * Update a provider's availability slots in Firestore.
 * @param uid - The provider's UID.
 * @param newAvailability - Array of time slot strings (e.g., "Monday 09:00").
 */
export async function updateAvailability(uid: string, newAvailability: string[]) {
  const ref = doc(db, 'availability', uid);
  await updateDoc(ref, {
    slots: newAvailability,
  });

  const userRef = doc(db, 'users', uid);
  const nextTs = (() => {
    const now = Date.now();
    const times = newAvailability
      .map((s) => {
        const [day, time] = s.split(' ');
        return new Date(`${getNextDateForWeekday(day)}T${time}:00`).getTime();
      })
      .filter((t) => t > now);
    return times.length ? Math.min(...times) : null;
  })();

  await updateDoc(userRef, { nextAvailableTs: nextTs, availabilitySlots: newAvailability });
}
