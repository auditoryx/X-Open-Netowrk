import { db } from '@lib/firebase/init';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function createNotification(uid: string, type: string, message: string, relatedId: string) {
  try {
    await addDoc(collection(db, 'notifications', uid, 'messages'), {
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
