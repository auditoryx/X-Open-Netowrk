import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/init';

export const getCreatorReviews = async (creatorId: string) => {
  const q = query(
    collection(firestore, 'bookings'),
    where('providerId', '==', creatorId),
    where('status', '==', 'completed')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => doc.data())
    .filter((b) => b.review && b.review.verified);
};
