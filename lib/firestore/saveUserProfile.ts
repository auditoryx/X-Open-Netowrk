import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/init';

export const saveUserProfile = async (uid: string, profileData: any) => {
  await setDoc(doc(firestore, 'users', uid), {
    ...profileData,
    isVerified: false,
    createdAt: serverTimestamp(),
  });
};
