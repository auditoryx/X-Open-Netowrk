import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/app/firebase';

export async function getAverageRating(providerId: string): Promise<number | null> {
  const db = getFirestore(app);
  const q = query(collection(db, 'reviews'), where('providerId', '==', providerId));
  const snap = await getDocs(q);
  const ratings = snap.docs.map(doc => doc.data().rating).filter(r => typeof r === 'number');
  if (ratings.length === 0) return null;
  const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return Math.round(average * 10) / 10;
}
