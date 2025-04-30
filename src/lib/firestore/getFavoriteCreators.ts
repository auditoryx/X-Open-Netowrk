import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export async function getFavoriteCreators(uid: string) {
  const db = getFirestore(app);

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return [];

  const favorites: string[] = userSnap.data().favorites || [];

  if (!favorites.length) return [];

  const creatorsRef = collection(db, 'users');
  const q = query(creatorsRef, where('__name__', 'in', favorites));

  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
