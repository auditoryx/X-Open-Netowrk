const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, '../auditoryx-admin-key.json'));
const uid = process.argv[2];

if (!uid) {
  console.error('❌ Usage: node scripts/setAdminRole.js <UID>');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

admin.auth().setCustomUserClaims(uid, { admin: true }).then(() => {
  console.log(`✅ Admin rights granted to ${uid}`);
  process.exit(0);
}).catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
