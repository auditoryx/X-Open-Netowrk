import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@lib/firebase/init';

export const createBooking = async (bookingData: {
  clientId: string,
  providerId: string,
  service: string,
  dateTime: string,
  message?: string
}) => {
  const isoTime = new Date(bookingData.dateTime).toISOString();
  const docRef = await addDoc(collection(firestore, 'bookings'), {
    ...bookingData,
    dateTime: isoTime,
    status: 'pending',
    createdAt: serverTimestamp(),
    paid: false,
  });
  return docRef.id;
};
