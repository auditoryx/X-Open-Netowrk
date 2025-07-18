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
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';

export const queryCreators = async (filters: {
  role: string;
  verifiedOnly: boolean;
  location?: string;
  service?: string;
  genres?: string[];
  minBpm?: number;
  maxBpm?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}) => {
  const ref = collection(db, 'users');
  const constraints = [];

  if (filters.role) {
    constraints.push(where(SCHEMA_FIELDS.USER.ROLE, '==', filters.role));
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

  if (filters.genres && filters.genres.length > 0) {
    constraints.push(where('genres', 'array-contains-any', filters.genres));
  }

  if (filters.minBpm !== undefined) {
    constraints.push(where('maxBpm', '>=', filters.minBpm));
  }

  if (filters.maxBpm !== undefined) {
    constraints.push(where('minBpm', '<=', filters.maxBpm));
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

export const getFeaturedCreators = async (limit: number = 10) => {
  try {
    const ref = collection(db, 'users');
    const q = query(
      ref,
      where('featured', '==', true),
      orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'),
      orderBy(SCHEMA_FIELDS.USER.TIER, 'desc')
    );
    const snapshot = await getDocs(q);
    
    const results: (UserProfile & { id: string })[] = snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as UserProfile) }))
      .filter(isProfileComplete)
      .slice(0, limit);
    
    return results;
  } catch (error) {
    console.error('Error fetching featured creators:', error);
    return [];
  }
};

export const searchCreators = async (searchQuery: string, filters: {
  role?: string;
  verifiedOnly?: boolean;
  location?: string;
  limit?: number;
}) => {
  try {
    const ref = collection(db, 'users');
    const constraints = [];

    if (filters.role) {
      constraints.push(where(SCHEMA_FIELDS.USER.ROLE, '==', filters.role));
    }

    if (filters.verifiedOnly) {
      constraints.push(where('verified', '==', true));
    }

    if (filters.location) {
      constraints.push(where('location', '==', filters.location));
    }

    const q = query(ref, ...constraints);
    const snapshot = await getDocs(q);

    let results: (UserProfile & { id: string })[] = snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as UserProfile) }))
      .filter(isProfileComplete);

    // Client-side search filtering
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      results = results.filter(creator => 
        creator.displayName?.toLowerCase().includes(searchLower) ||
        creator.bio?.toLowerCase().includes(searchLower) ||
        creator.services?.some(service => service.toLowerCase().includes(searchLower)) ||
        creator.genres?.some(genre => genre.toLowerCase().includes(searchLower))
      );
    }

    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  } catch (error) {
    console.error('Error searching creators:', error);
    return [];
  }
};
