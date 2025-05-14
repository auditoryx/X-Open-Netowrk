import { isProfileComplete } from '@/lib/profile/isProfileComplete';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { UserProfile } from '@/types/user';

export async function getAllCreators() {
  const db = getFirestore(app);
  const snapshot = await getDocs(collection(db, 'users'));

  return snapshot.docs
    .map((doc) => ({ uid: doc.id, ...doc.data() } as UserProfile & { isVisible?: boolean }))
    .filter(isProfileComplete)
    .filter((u) => u.isVisible !== false);
}
