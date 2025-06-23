// Load TypeScript on-the-fly
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
});

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const Sentry    = require('./sentry');

admin.initializeApp();

/* ───────── Cloud Functions ───────── */

// Stripe
exports.handleStripeWebhook   = require('./src/stripe/handleStripeWebhook');
exports.createCheckoutSession = require('./src/stripe/createCheckoutSession');


// Maintenance jobs
// exports.cleanupOldBookings  = require('./src/maintenance/cleanupOldBookings'); // ⬅ keep commented until implemented
exports.streakReset           = require('./src/maintenance/streakReset');
exports.calcTierAndRank       = require('./src/cron/calcTierAndRank');

// Dev-only admin helper (consider gating by env)
exports.grantAdmin = functions.https.onCall(async (data, context) => {
  const YOUR_UID = 'MGBCYJHGVHXHXRXmUv8f64WCQuB2';
  if (context.auth?.uid !== YOUR_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Not allowed');
  }
  await admin.auth().setCustomUserClaims(data.uid, { admin: true });
  return { success: true };
});
