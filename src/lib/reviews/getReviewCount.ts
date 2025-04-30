import { getFirestore, collection, query, where, getCountFromServer } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export async function getReviewCount(providerId: string): Promise<number> {
  const db = getFirestore(app);
  const ref = collection(db, 'reviews');
  const q = query(ref, where('providerId', '==', providerId));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}
