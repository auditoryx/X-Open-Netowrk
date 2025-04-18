const admin = require('firebase-admin');
const serviceAccount = require('./auditoryx-admin-key.json'); // make sure the key file is in this directory

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = 'MGBCYJHGVHXHXRXmUv8f64WCQuB2'; // 👈 your actual UID

admin.auth().setCustomUserClaims(uid, { admin: true }).then(() => {
  console.log(`✅ Admin claim granted to ${uid}`);
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
