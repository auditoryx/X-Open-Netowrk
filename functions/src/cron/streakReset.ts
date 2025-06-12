import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const streakReset = functions.pubsub
  .schedule('every day 06:00')
  .timeZone('UTC')
  .onRun(async () => {
    const users = await admin.firestore()
      .collection('users')
      .where('streak', '>', 0)
      .get();

    const batch = admin.firestore().batch();
    users.docs.forEach(doc => {
      batch.update(doc.ref, { streak: 0 });
    });
    await batch.commit();
    console.log(`Streak reset for ${users.size} users.`);
  });
