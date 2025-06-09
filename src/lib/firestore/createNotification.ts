import { db } from '@lib/firebase/init';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function createNotification(uid: string, type: string, message: string, relatedId: string) {
  try {
    const ref = doc(db, 'notifications', uid);
    await setDoc(ref, {
      userId: uid,
      type,
      message,
      relatedId,
      createdAt: serverTimestamp(),
      read: false,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
