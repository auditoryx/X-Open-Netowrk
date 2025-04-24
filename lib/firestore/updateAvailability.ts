import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/init';

export const updateAvailability = async (providerId: string, availability: string[]) => {
  const providerRef = doc(firestore, 'users', providerId);
  await updateDoc(providerRef, { availability });
};
