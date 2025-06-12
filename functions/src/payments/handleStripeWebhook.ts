import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { markAsHeld } from './markAsHeld';

const stripe = new Stripe(functions.config().stripe.secret, { apiVersion: '2023-10-16' });
const endpointSecret = functions.config().stripe.webhook_secret;

export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verify failed', err);
    return res.status(400).send('Webhook Error');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      await admin.firestore().doc(`bookings/${bookingId}`).update({ status: 'paid' });
      await markAsHeld(bookingId);
    }
  }

  res.sendStatus(200);
});
