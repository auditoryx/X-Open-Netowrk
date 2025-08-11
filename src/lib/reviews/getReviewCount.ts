import { getFirestore, collection, query, where, getCountFromServer } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export async function getReviewCount(targetId: string): Promise<number> {
  const db = getFirestore(app);
  const ref = collection(db, 'reviews');
  const q = query(
    ref, 
    where(SCHEMA_FIELDS.REVIEW.TARGET_ID, '==', targetId),
    where('visible', '==', true)
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}
