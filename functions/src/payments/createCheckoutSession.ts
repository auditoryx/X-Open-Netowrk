import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

const stripe = new Stripe(functions.config().stripe.secret, { apiVersion: '2023-10-16' });

export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { bookingId, price, currency = 'usd' } = data;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{ price_data: { currency, unit_amount: Math.floor(price * 100), product_data: { name: `Booking ${bookingId}` } }, quantity: 1 }],
    metadata: { bookingId },
    success_url: functions.config().stripe.success_url,
    cancel_url: functions.config().stripe.cancel_url
  });

  await admin.firestore().collection('bookings').doc(bookingId).update({ checkoutSessionId: session.id });
  return { url: session.url };
});
