import admin from '@/lib/firebase-admin';
import { z } from 'zod';
import { logActivity } from '@/lib/firestore/logging/logActivity';

const schema = z.object({
  bookingId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(['provider', 'admin']), // Extend roles here if needed
});

export async function markAsReleased(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    console.error('❌ Invalid release input:', parsed.error.format());
    return { error: 'Invalid input' };
  }

  const { bookingId, userId, role } = parsed.data;

  // 🔐 Authorization: only provider or admin can release funds
  if (!['provider', 'admin'].includes(role)) {
    console.warn('⚠️ Unauthorized fund release attempt by:', userId);
    return { error: 'Unauthorized' };
  }

  try {
    const db = admin.firestore();
    await db.collection('bookings').doc(bookingId).update({
      paymentStatus: 'released',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await logActivity(userId, 'payment_released', {
      bookingId,
      byRole: role,
    });

    return { success: true };
  } catch (err: any) {
    console.error('🔥 Failed to release payment:', err.message);
    return { error: 'Failed to release payment' };
  }
}
