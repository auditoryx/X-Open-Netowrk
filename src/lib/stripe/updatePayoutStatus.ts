import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

const schema = z.object({
  bookingId: z.string(),
  userId: z.string(),
  payoutStatus: z.enum(['pending', 'paid', 'failed']),
});

export async function updatePayoutStatus(input: unknown, sessionUserId: string) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    console.error('Invalid payout update input:', parsed.error.format());
    return { error: 'Invalid request' };
  }

  const { bookingId, userId, payoutStatus } = parsed.data;

  // 🔒 Enforce that the current user is allowed to mark this payout
  if (sessionUserId !== userId) {
    console.warn(`Unauthorized payout update attempt by ${sessionUserId}`);
    return { error: 'Unauthorized' };
  }

  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      payoutStatus,
    });

    return { success: true };
  } catch (err: any) {
    console.error('Payout status update failed:', err.message);
    return { error: 'Could not update payout status' };
  }
}
