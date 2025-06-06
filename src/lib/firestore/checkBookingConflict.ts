import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '@lib/firebase/init';

export async function checkBookingConflict(providerId: string, dateTime: string) {
  const isoTime = new Date(dateTime).toISOString();
  const q = query(
    collection(firestore, 'bookings'),
    where('providerId', '==', providerId),
    where('dateTime', '==', isoTime)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
