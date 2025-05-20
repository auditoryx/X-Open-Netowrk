import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

export const queryCreators = async (filters: {
  role: string;
  verifiedOnly: boolean;
  location?: string;
  service?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}) => {
  let ref = collection(db, 'users');
  const constraints = [];

  if (filters.role) {
    constraints.push(where('role', '==', filters.role));
  }

  if (filters.verifiedOnly) {
    constraints.push(where('verified', '==', true));
  }

  if (filters.location) {
    constraints.push(where('location', '==', filters.location));
  }

  if (filters.service) {
    constraints.push(where('services', 'array-contains', filters.service));
  }

  if (filters.sortKey) {
    constraints.push(orderBy(filters.sortKey, filters.sortDirection || 'desc'));
  }

  if (filters.lat && filters.lng && filters.radiusKm) {
    console.warn('🔜 Geo radius filtering not implemented yet');
    // Later: use a geohash or Firestore extension or distance calc
  }

  const q = query(ref, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
