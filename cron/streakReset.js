const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

const DAY_MS = 24 * 60 * 60 * 1000;

async function resetStreaks() {
  const now = Date.now();
  const users = await db.collection('users').get();
  const batch = db.batch();
  users.forEach(doc => {
    const data = doc.data();
    const last = data.lastActivityAt?.toMillis ? data.lastActivityAt.toMillis() :
      data.lastActivityAt?.seconds ? data.lastActivityAt.seconds * 1000 : null;
    if (!last || now - last >= DAY_MS) {
      batch.update(doc.ref, { streakCount: 0 });
    }
  });
  await batch.commit();
}

resetStreaks().then(() => {
  console.log('Streaks reset');
}).catch(err => {
  console.error(err);
  process.exit(1);
});
