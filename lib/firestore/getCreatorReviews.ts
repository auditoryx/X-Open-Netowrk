import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@lib/firebase/init';

export const getCreatorReviews = async (creatorId: string) => {
  const q = query(
    collection(firestore, 'bookings'),
    where(SCHEMA_FIELDS.BOOKING.PROVIDER_ID, '==', creatorId),
    where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'completed')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => doc.data())
    .filter((b) => b.review && b.review.verified);
};
