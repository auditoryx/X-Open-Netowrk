const admin = require('firebase-admin');

async function markAsHeld(bookingId) {
  await admin.firestore().doc(`bookings/${bookingId}`).update({ payoutStatus: 'held' });
}

module.exports = { markAsHeld };
