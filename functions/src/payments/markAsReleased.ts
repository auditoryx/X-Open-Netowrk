import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const stripe = new Stripe(functions.config().stripe.secret, { apiVersion: '2023-10-16' });

export async function markAsReleased(bookingId: string) {
  const bookingRef = admin.firestore().doc(`bookings/${bookingId}`);
  const bookingSnap = await bookingRef.get();
  const booking = bookingSnap.data();
  if (!booking || booking.payoutStatus === 'released') return;

  await stripe.transfers.create({
    amount: Math.floor(booking.price * 100),
    currency: 'usd',
    destination: booking.providerStripeId,
    metadata: { bookingId }
  });

  await bookingRef.update({ payoutStatus: 'released', releasedAt: admin.firestore.FieldValue.serverTimestamp() });
}
