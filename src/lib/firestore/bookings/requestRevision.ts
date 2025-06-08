import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logActivity } from '@/lib/firestore/logging/logActivity';
import { z } from 'zod';

const schema = z.object({
  bookingId: z.string().min(1),
  userId: z.string().min(1),
});

export async function requestRevision(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    console.error('❌ Invalid requestRevision input:', parsed.error.format());
    return { error: 'Invalid input' } as const;
  }

  const { bookingId, userId } = parsed.data;

  try {
    const bookingRef = adminDb.collection('bookings').doc(bookingId);
    const snap = await bookingRef.get();
    const data = snap.data();
    if (!data) throw new Error('Booking not found');

    const current = data.revisionsRemaining ?? 0;
    if (current <= 0) {
      return { error: 'No revisions remaining' } as const;
    }

    await bookingRef.update({
      revisionsRemaining: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity(userId, 'revision_requested', { bookingId });

    return { success: true, revisionsRemaining: current - 1 } as const;
  } catch (err: any) {
    console.error('🔥 Failed to request revision:', err.message);
    return { error: 'Failed to request revision' } as const;
  }
}
