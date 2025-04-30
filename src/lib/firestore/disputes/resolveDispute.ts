import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function resolveDispute(disputeId: string, newStatus: 'resolved' | 'rejected') {
  const ref = doc(db, 'disputes', disputeId);
  await updateDoc(ref, {
    status: newStatus,
    resolvedAt: new Date(),
  });
}
