import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/init';

export const getTopCreators = async () => {
  const q = query(
    collection(firestore, 'bookings'),
    where('status', '==', 'completed')
  );

  const snapshot = await getDocs(q);
  const bookings = snapshot.docs
    .map((doc) => doc.data())
    .filter((b) => b.review && b.review.rating);

  const grouped: { [key: string]: { total: number; count: number } } = {};

  for (const b of bookings) {
    if (!grouped[b.providerId]) {
      grouped[b.providerId] = { total: 0, count: 0 };
    }
    grouped[b.providerId].total += b.review.rating;
    grouped[b.providerId].count += 1;
  }

  const ranked = Object.entries(grouped)
    .map(([providerId, data]) => ({
      providerId,
      avgRating: data.total / data.count,
      reviewCount: data.count,
    }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 10);

  return ranked;
};
