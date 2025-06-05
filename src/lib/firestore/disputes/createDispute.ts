import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { sendDisputeEmail } from '@/lib/email/sendDisputeEmail';
import { logActivity } from '@/lib/firestore/logging/logActivity';
import { z } from 'zod';

async function notifyAdmin(bookingId: string, fromUser: string, reason: string) {
  const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL || null
  await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'admin-notify',
      email,
      type: 'dispute',
      title: 'New Dispute Filed',
      message: `A dispute was filed for booking ${bookingId}`,
      link: `/admin/disputes`
    })
  })
}

const disputeSchema = z.object({
  bookingId: z.string().min(1),
  fromUser: z.string().min(1),
  reason: z.string().min(5),
});

export async function createDispute(input: unknown) {
  const parsed = disputeSchema.safeParse(input);
  if (!parsed.success) {
    console.error('Invalid dispute submission:', parsed.error.format());
    return { error: 'Invalid dispute data' };
  }

  const { bookingId, fromUser, reason } = parsed.data;

  // 🧯 Anti-Spam: Limit 1 dispute per 60 seconds per user
  const cooldownRef = doc(db, 'disputeCooldowns', fromUser);
  const cooldownSnap = await getDoc(cooldownRef);

  if (cooldownSnap.exists()) {
    const lastSent = cooldownSnap.data().timestamp?.toMillis() || 0;
    const now = Date.now();

    if (now - lastSent < 60_000) {
      console.warn('Dispute submission throttled for user:', fromUser);
      return { error: 'You must wait before submitting another dispute.' };
    }
  }

  try {
    await addDoc(collection(db, 'disputes'), {
      bookingId,
      fromUser,
      reason,
      status: 'open',
      createdAt: Timestamp.now(),
    });

    await setDoc(cooldownRef, {
      timestamp: Timestamp.now(),
    });

    await sendDisputeEmail(bookingId, fromUser, reason);
    await notifyAdmin(bookingId, fromUser, reason);
    await logActivity(fromUser, 'dispute_opened', { bookingId, reason });

    return { success: true };
  } catch (err: any) {
    console.error('Error creating dispute:', err.message);
    return { error: 'Dispute could not be submitted.' };
  }
}
