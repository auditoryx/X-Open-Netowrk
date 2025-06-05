import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export const getAllCreators = async () => {
  const creatorsQuery = query(
    collection(db, 'users'),
    where('role', '==', 'producer'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(creatorsQuery);

  return snap.docs.map((doc) => {
    const data = doc.data();
    const uid = doc.id;

    // If availability exists, pick next slot
    let nextAvailable = null;
    if (Array.isArray(data.availability) && data.availability.length > 0) {
      const sorted = data.availability
        .map((slot: string) => new Date(slot))
        .filter((date) => date > new Date())
        .sort((a, b) => a.getTime() - b.getTime());

      if (sorted.length > 0) {
        nextAvailable = format(sorted[0], 'MMM d, yyyy');
      }
    }

    return {
      uid,
      displayName: data.displayName,
      role: data.role,
      verified: data.verified || false,
      location: data.location || '',
      locationLat: data.locationLat || null,
      locationLng: data.locationLng || null,
      price: data.price ?? null,
      nextAvailable,
    };
  });
};
