const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Sentry = require('./sentry');

admin.initializeApp();

exports.grantAdmin = functions.https.onCall(async (data, context) => {
  const YOUR_UID = 'MGBCYJHGVHXHXRXmUv8f64WCQuB2';

  if (context.auth?.uid !== YOUR_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Not allowed');
  }

  await admin.auth().setCustomUserClaims(data.uid, { admin: true });
  return { success: true };
});

