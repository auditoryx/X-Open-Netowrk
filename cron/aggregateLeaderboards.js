const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function generate(period, top = 10) {
  const usersSnap = await db.collection('users').orderBy('points', 'desc').limit(top).get();
  const entries = usersSnap.docs.map(d => ({ uid: d.id, points: d.data().points || 0 }));
  await db.collection('leaderboards').doc(period).set({
    period,
    generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    entries,
  });
  return entries;
}

async function main() {
  await generate('weekly');
  await generate('monthly');
  console.log('Leaderboards aggregated');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
