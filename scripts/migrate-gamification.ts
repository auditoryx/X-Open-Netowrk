import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, applicationDefault } from 'firebase-admin/app';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function migrateGamification() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const update: any = {};
    if (typeof data.xp !== 'number') update.xp = 0;
    if (typeof data.rankScore !== 'number') update.rankScore = 0;
    if (!data.tier) update.tier = 'standard';
    if (Object.keys(update).length > 0) {
      await doc.ref.update(update);
      updated++;
      console.log(`Updated user ${doc.id}:`, update);
    }
  }
  console.log(`Migration complete. Updated ${updated} users.`);
}

migrateGamification().catch(console.error);
