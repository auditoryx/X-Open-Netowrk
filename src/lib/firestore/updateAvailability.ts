import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

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
}
