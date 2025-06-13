import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export async function getFeaturedCreators() {
  const db = getFirestore(app);
  const q = query(
    collection(db, 'users'),
    where('verified', '==', true),
    orderBy('averageRating', 'desc'),
    limit(4)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ uid: doc.id, ...(doc.data() as any) }));
}
