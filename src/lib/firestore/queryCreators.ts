import { isProfileComplete } from '@/lib/profile/isProfileComplete';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { cityToCoords } from '@/lib/utils/cityToCoords';
import { UserProfile } from '@/types/user'; // ✅ import type

export async function queryCreators(filters: {
  role?: string;
  verifiedOnly?: boolean;
  location?: string;
  proTier?: 'standard' | 'verified' | 'signature';
  lat?: number;
  lng?: number;
  radiusKm?: number;
}) {
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

  if (filters.proTier) {
    qConstraints.push(where('proTier', '==', filters.proTier));
  }

  const q = query(collection(db, 'users'), ...qConstraints);
  const snapshot = await getDocs(q);

  let results = snapshot.docs
    .map((doc) => ({ uid: doc.id, ...doc.data() } as UserProfile))
    .filter(isProfileComplete);

  if (filters.lat && filters.lng) {
    const radius = filters.radiusKm ?? 50;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dist = (
      lat1: number,
      lng1: number,
      lat2: number,
      lng2: number
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
}
