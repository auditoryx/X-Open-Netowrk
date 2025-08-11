import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';

export async function getRatingDistribution(targetId: string): Promise<Record<number, number>> {
  const db = getFirestore(app);
  const q = query(
    collection(db, 'reviews'), 
    where(SCHEMA_FIELDS.REVIEW.TARGET_ID, '==', targetId),
    where('visible', '==', true)
  );
  const snap = await getDocs(q);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const doc of snap.docs) {
    const rating = doc.data().rating;
    if (typeof rating === 'number' && rating >= 1 && rating <= 5) {
      distribution[rating] = (distribution[rating] || 0) + 1;
    }
  }
  return distribution;
}
