import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function submitSupportMessage({
  uid,
  email,
  message,
  type = 'general',
}: {
  uid: string;
  email: string;
  message: string;
  type?: 'bannedAppeal' | 'contractIssue' | 'bookingProblem' | 'general';
}) {
  try {
    await addDoc(collection(db, 'supportMessages'), {
      uid,
      email,
      message,
      type,
      status: 'open',
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err: any) {
    console.error('❌ Failed to submit support message:', err.message);
    return { error: 'Could not submit support message' };
  }
}
