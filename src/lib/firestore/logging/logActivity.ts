import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

export async function logActivity(
  uid: string,
  actionType: string,
  details: Record<string, any> = {},
  context: {
    ip?: string;
    userAgent?: string;
  } = {}
) {
  if (!uid || !actionType) {
    console.warn('logActivity called with missing uid or actionType');
    return;
  }

  const payload = {
    actionType,
    timestamp: serverTimestamp(),
    details,
    ip: context.ip || null,
    userAgent: context.userAgent || null,
  };

  try {
    await addDoc(collection(db, 'activityLogs', uid, 'logs'), payload);

    // Award points for key actions
    if (actionType === 'booking_completed') {
      await updateDoc(doc(db, 'users', uid), { points: increment(10) });
    }
    if (actionType === 'review_submitted') {
      await updateDoc(doc(db, 'users', uid), { points: increment(5) });
    }
  } catch (err: any) {
    console.error(`❌ logActivity failed for uid=${uid}:`, err.message);
  }
}
