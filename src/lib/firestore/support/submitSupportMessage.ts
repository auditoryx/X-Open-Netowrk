import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function submitSupportMessage({
  uid,
  email,
  message,
}: {
  uid: string;
  email: string;
  message: string;
}) {
  try {
    await addDoc(collection(db, 'supportMessages'), {
      uid,
      email,
      message,
      status: 'open',
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err: any) {
    console.error('❌ Failed to submit support message:', err.message);
    return { error: 'Could not submit support message' };
  }
}
