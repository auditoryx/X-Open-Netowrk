import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '@lib/firebase/init';
import { SCHEMA_FIELDS } from '../SCHEMA_FIELDS';

export async function checkBookingConflict(providerId: string, dateTime: string) {
  const q = query(
    collection(firestore, 'bookings'),
    where(SCHEMA_FIELDS.BOOKING.PROVIDER_ID, '==', providerId),
    where('dateTime', '==', dateTime)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
