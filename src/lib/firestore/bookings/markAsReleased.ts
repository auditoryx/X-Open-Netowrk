import admin from '@/lib/firebase-admin';
import Stripe from 'stripe';
import { z } from 'zod';
import { logActivity } from '@/lib/firestore/logging/logActivity';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const schema = z.object({
  bookingId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(['provider', 'admin']),
});

export async function markAsReleased(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    console.error('❌ Invalid release input:', parsed.error.format());
    return { error: 'Invalid input' } as const;
  }

  const { bookingId, userId, role } = parsed.data;

  // 🔐 Only provider or admin can release payouts
  if (!['provider', 'admin'].includes(role)) {
    console.warn('⚠️ Unauthorized fund release attempt by:', userId);
    return { error: 'Unauthorized' } as const;
  }

  try {
    const db = admin.firestore();
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();
    const booking = bookingSnap.data();
    if (!booking) throw new Error('Booking not found');

    const providerSnap = await db.collection('users').doc(booking.providerId).get();
    const provider = providerSnap.data();
    if (!provider?.stripeAccountId) {
      throw new Error('No Stripe account connected for provider');
    }

    const amount = booking.totalAmount || 0;
    await stripe.transfers.create({
      amount: Math.floor(amount * 100),
      currency: 'usd',
      destination: provider.stripeAccountId,
      metadata: { bookingId },
    });

    await bookingRef.update({
      payoutStatus: 'released',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await logActivity(userId, 'payment_released', { bookingId, byRole: role });

    return { success: true } as const;
  } catch (err: any) {
    console.error('🔥 Failed to release payment:', err.message);
    return { error: 'Failed to release payment' } as const;
  }
}
