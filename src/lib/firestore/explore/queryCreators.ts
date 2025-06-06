import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { isProfileComplete } from '@/lib/profile/isProfileComplete';
import { cityToCoords } from '@/lib/utils/cityToCoords';
import { UserProfile } from '@/types/user';

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

  const q = query(ref, ...constraints);
  const snapshot = await getDocs(q);

  let results: (UserProfile & { id: string })[] = snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as UserProfile) }))
    .filter(isProfileComplete);

  if (filters.lat && filters.lng) {
    const radius = filters.radiusKm ?? 50;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dist = (
      lat1: number,
      lng1: number,
      lat2: number,
      lng2: number,
    ) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    results = results.filter((c) => {
      let lat = (c as any).locationLat as number | null;
      let lng = (c as any).locationLng as number | null;
      if (!lat || !lng) {
        const key = (c as any).location?.toLowerCase()?.replace(/\s+/g, '') || '';
        const fb = cityToCoords[key];
        if (fb) {
          lng = fb[0];
          lat = fb[1];
        }
      }
      if (!lat || !lng) return false;
      return dist(lat, lng, filters.lat!, filters.lng!) <= radius;
    });
  }

  return results;
};
