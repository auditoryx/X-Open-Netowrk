import { isProfileComplete } from '@/lib/profile/isProfileComplete';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startAfter,
  limit as fsLimit,
  doc,
  getDoc,
} from 'firebase/firestore';
import { cityToCoords } from '@/lib/utils/cityToCoords';
import { UserProfile } from '@/types/user'; // ✅ import type
import { getAverageRating } from '@/lib/reviews/getAverageRating';

export async function queryCreators(filters: {
  role?: string;
  verifiedOnly?: boolean;
  location?: string;
  service?: string;
  genres?: string[];
  minBpm?: number;
  maxBpm?: number;
  proTier?: 'standard' | 'verified' | 'signature';
  availableNow?: boolean;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  limit?: number;
  cursor?: string;
  sort?: 'rating' | 'distance' | 'popularity';
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

  if (filters.service) {
    qConstraints.push(
      where('services', 'array-contains', filters.service.toLowerCase())
    );
  }

  if (filters.genres && filters.genres.length > 0) {
    qConstraints.push(where('genres', 'array-contains-any', filters.genres));
  }

  if (filters.minBpm !== undefined) {
    qConstraints.push(where('maxBpm', '>=', filters.minBpm));
  }

  if (filters.maxBpm !== undefined) {
    qConstraints.push(where('minBpm', '<=', filters.maxBpm));
  }

  if (filters.proTier) {
    qConstraints.push(where('proTier', '==', filters.proTier));
  }

  if (filters.availableNow) {
    qConstraints.push(
      where(
        'nextAvailableTs',
        '<=',
        Date.now() + 72 * 60 * 60 * 1000,
      ),
    );
  }

  const base = query(
    collection(db, 'users'),
    ...qConstraints,
    orderBy('createdAt', 'desc'),
    fsLimit(filters.limit || 20)
  );

  let qSnap = base;
  if (filters.cursor) {
    const lastDoc = await getDoc(doc(db, 'users', filters.cursor));
    if (lastDoc.exists()) {
      qSnap = query(base, startAfter(lastDoc));
    }
  }

  const snapshot = await getDocs(qSnap);

  let results = snapshot.docs
    .map((doc) => ({ uid: doc.id, ...doc.data() } as UserProfile))
    .filter(isProfileComplete);

  if (filters.availableNow) {
    const cutoff = Date.now() + 72 * 60 * 60 * 1000;
    results = results.filter(
      (c) =>
        typeof (c as any).nextAvailableTs === 'number' &&
        (c as any).nextAvailableTs <= cutoff,
    );
  }

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

  if (filters.sort === 'distance' && filters.lat && filters.lng) {
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

    results = results
      .map((c) => {
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
        const distance = lat && lng ? dist(lat, lng, filters.lat!, filters.lng!) : Infinity;
        return { ...c, _distance: distance } as any;
      })
      .sort((a, b) => (a._distance || 0) - (b._distance || 0));
  } else if (filters.sort === 'popularity') {
    results = results.sort((a, b) => (b.points || 0) - (a.points || 0));
  } else if (filters.sort === 'rating') {
    const withRatings = await Promise.all(
      results.map(async (c) => {
        const rating = await getAverageRating(c.uid);
        return { ...c, _rating: rating ?? 0 } as any;
      })
    );
    results = withRatings.sort((a, b) => (b._rating || 0) - (a._rating || 0));
  }

  const nextCursor = snapshot.docs.length
    ? snapshot.docs[snapshot.docs.length - 1].id
    : null;

  return { results, nextCursor };
}
