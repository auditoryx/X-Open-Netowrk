import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/firebaseConfig';


export async function agreeToContract(bookingId: string, role: 'client' | 'provider') {
  const field = role === 'client' ? 'contract.agreedByClient' : 'contract.agreedByProvider';
  const ref = doc(db, 'bookings', bookingId);
  await updateDoc(ref, {
    [field]: true,
  });
}
