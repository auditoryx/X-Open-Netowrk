import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function queryCreators(filters: { role?: string; verifiedOnly?: boolean; location?: string }) {
  const qConstraints = [];

  if (filters.role) {
    qConstraints.push(where('role', '==', filters.role));
  }

  if (filters.verifiedOnly) {
    qConstraints.push(where('verified', '==', true));
  }

  if (filters.location) {
    qConstraints.push(where('location', '==', filters.location));
  }

  const q = query(collection(db, 'users'), ...qConstraints);

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  }));
}
