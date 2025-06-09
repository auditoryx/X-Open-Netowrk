import { db } from '../../../firebase/firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendBookingConfirmation } from '@/functions/sendBookingConfirmation';
import { createNotification } from '@/lib/firestore/createNotification';
import { logActivity } from '@/lib/firestore/logging/logActivity';
import { UserProfile } from '@/types/user';
import { isProfileComplete } from '@/lib/profile/isProfileComplete';

type BookingData = {
  id: string;
  clientId: string;
  providerId: string;
  providerProfile: UserProfile;
  serviceId: string;
  serviceName: string;
  datetime: string;
  notes?: string;
};

export async function saveBookingToFirestore(bookingData: BookingData, clientEmail: string) {
  if (!isProfileComplete(bookingData.providerProfile)) {
    throw new Error('Provider profile is incomplete');
  }

  const bookingRef = doc(db, 'bookings', bookingData.id);
  const title = `${bookingData.serviceName?.split(' ')[0] || 'Service'} Session with ${bookingData.providerProfile.name || 'Creator'}`;

  await setDoc(bookingRef, {
    ...bookingData,
    title,
    createdAt: serverTimestamp(),
    status: 'pending',
    contract: {
      terms: `This booking represents a mutual agreement between client and provider. If cancelled within 24h, provider reserves the right to charge partial fee.`,
      agreedByClient: false,
      agreedByProvider: false,
    },
  });

  await sendBookingConfirmation(clientEmail, bookingData.id);
  await createNotification(
    bookingData.clientId,
    'booking_created',
    'Your booking request has been sent!',
    bookingData.id
  );

  await logActivity(bookingData.clientId, 'booking_created', {
    providerId: bookingData.providerId,
    serviceId: bookingData.serviceId,
    date: bookingData.datetime,
  });

  return bookingData.id;
}
