import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function queryCreators(filters: { role?: string; location?: string; service?: string }) {
  const creatorsRef = collection(db, 'users');
  let q = query(creatorsRef);

  if (filters.role) {
    q = query(q, where('role', '==', filters.role));
  }
  if (filters.location) {
    q = query(q, where('location', '==', filters.location));
  }
  if (filters.service) {
    q = query(q, where('services', 'array-contains', filters.service));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
