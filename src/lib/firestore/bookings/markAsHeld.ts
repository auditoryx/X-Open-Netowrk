import { admin, adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { logActivity } from '@/lib/firestore/logging/logActivity';

const schema = z.object({
  bookingId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(['client', 'admin']),
});

export async function markAsHeld(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    console.error('❌ Invalid input to markAsHeld:', parsed.error.format());
    return { error: 'Invalid input' };
  }

  const { bookingId, userId, role } = parsed.data;

  // 🔐 Only client or admin should be allowed
  if (!['client', 'admin'].includes(role)) {
    console.warn(`❌ Unauthorized attempt to hold funds by ${userId}`);
    return { error: 'Unauthorized' };
  }

  try {
    const db = adminDb;
    await db.collection('bookings').doc(bookingId).update({
      paymentStatus: 'held',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await logActivity(userId, 'payment_held', { bookingId, byRole: role });

    return { success: true };
  } catch (err: any) {
    console.error('🔥 Failed to mark booking as held:', err.message);
    return { error: 'Failed to hold funds' };
  }
}
