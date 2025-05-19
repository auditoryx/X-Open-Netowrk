import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function agreeToContract(
  bookingId: string,
  role: 'client' | 'provider',
  sessionUserId: string
) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      console.warn('Booking not found:', bookingId);
      return { error: 'Booking not found' };
    }

    const data = bookingSnap.data();

    const expectedUid = role === 'client' ? data.clientId : data.providerId;
    if (sessionUserId !== expectedUid) {
      console.warn('Unauthorized contract agreement attempt by:', sessionUserId);
      return { error: 'You are not authorized to sign this contract.' };
    }

    const field = role === 'client' ? 'contract.agreedByClient' : 'contract.agreedByProvider';
    const timestampField = role === 'client' ? 'contract.clientAgreedAt' : 'contract.providerAgreedAt';

    await updateDoc(bookingRef, {
      [field]: true,
      [timestampField]: serverTimestamp(),
    });

    return { success: true };
  } catch (err: any) {
    console.error('Contract agreement error:', err.message);
    return { error: 'Could not sign contract' };
  }
}
// Compare this snippet from src/lib/firestore/notifications/createNotification.ts:
// import { db } from '@/lib/firebase';
// import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 