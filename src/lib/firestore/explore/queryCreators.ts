import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

export const queryCreators = async (filters: {
  role: string;
  verifiedOnly: boolean;
  location: string;
  service: string;
}) => {
  let ref = collection(db, 'users');
  const constraints = [];

  if (filters.role) {
    constraints.push(where('role', '==', filters.role));
  }

  if (filters.verifiedOnly) {
    constraints.push(where('verified', '==', true));
  }

  // Add support for location and service as needed
  if (filters.location) {
    constraints.push(where('location', '==', filters.location));
  }

  if (filters.service) {
    constraints.push(where('services', 'array-contains', filters.service));
  }

  const q = query(ref, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
