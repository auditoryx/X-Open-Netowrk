import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Sentry from './sentry';

// Initialize admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const DEFAULT_WINDOW_HOURS = 24;

export const cleanupOldBookings = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
    try {
      const windowHours = parseInt(process.env.BOOKING_EXPIRATION_HOURS || '', 10) || DEFAULT_WINDOW_HOURS;
      const cutoff = Date.now() - windowHours * 60 * 60 * 1000;
      const cutoffTs = admin.firestore.Timestamp.fromMillis(cutoff);

      const snapshot = await admin
        .firestore()
        .collection('bookings')
        .where('paid', '==', false)
        .where('createdAt', '<=', cutoffTs)
        .get();

      const batch = admin.firestore().batch();
      snapshot.forEach((doc) => batch.update(doc.ref, { status: 'expired' }));
      await batch.commit();

      console.log(`Expired ${snapshot.size} old bookings.`);
    } catch (err) {
      console.error('cleanupOldBookings failed:', err);
      Sentry.captureException(err);
    }
    return null;
  });
