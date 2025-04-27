import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function getTrustStats(uid: string) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return { badges: [], level: 'Bronze' };

  const userData = userDoc.data();
  const badges: string[] = [];
  let level = 'Bronze';

  const completedBookings = userData.completedBookings || 0;
  const averageRating = userData.averageRating || 0;
  const createdAt = userData.createdAt?.toDate?.() || new Date();

  if (createdAt < new Date('2025-07-01')) {
    badges.push('early_adopter');
  }
  if (averageRating >= 4.8) {
    badges.push('five_star');
  }
  if (completedBookings >= 10) {
    badges.push('super_collaborator');
  }

  if (completedBookings >= 20) {
    level = 'Platinum';
  } else if (completedBookings >= 10) {
    level = 'Gold';
  } else if (completedBookings >= 5) {
    level = 'Silver';
  } else {
    level = 'Bronze';
  }

  return { badges, level };
}
