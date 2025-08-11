import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';

export async function getAverageRating(targetId: string): Promise<number | null> {
  const db = getFirestore(app);
  const q = query(
    collection(db, 'reviews'), 
    where(SCHEMA_FIELDS.REVIEW.TARGET_ID, '==', targetId),
    where('visible', '==', true)
  );
  const snap = await getDocs(q);
  const ratings = snap.docs.map(doc => doc.data().rating).filter(r => typeof r === 'number');
  if (ratings.length === 0) return null;
  const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return Math.round(average * 10) / 10;
}
