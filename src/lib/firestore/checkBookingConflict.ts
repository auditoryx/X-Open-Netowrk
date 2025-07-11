import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '@lib/firebase/init';
import { SCHEMA_FIELDS } from '../SCHEMA_FIELDS';

export async function checkBookingConflict(providerId: string, dateTime: string) {
  const q = query(
    collection(firestore, 'bookings'),
    where('providerId', '==', providerId),
    where('dateTime', '==', dateTime)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

const bookingId = doc[SCHEMA_FIELDS.BOOKING_ID];
const conflict = doc[SCHEMA_FIELDS.CONFLICT];
