import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
  } catch (err: any) {
    console.error(`❌ logActivity failed for uid=${uid}:`, err.message);
  }
}
