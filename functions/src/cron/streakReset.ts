import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

export const resetResponsiveStreak = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const batch = admin.firestore().batch();
    const users = await admin.firestore().collection('users').get();
    users.forEach((doc) => {
      batch.update(doc.ref, { streakCount: 0 });
    });
    await batch.commit();
  });
