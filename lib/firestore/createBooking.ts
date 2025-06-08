import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@lib/firebase/init';

export const createBooking = async (bookingData: {
  clientId: string,
  providerId: string,
  service: string,
  dateTime: string,
  message?: string,
  quote?: number
}) => {
  const docRef = await addDoc(collection(firestore, 'bookings'), {
    ...bookingData,
    status: 'pending',
    createdAt: serverTimestamp(),
    paid: false,
  });
  return docRef.id;
};
