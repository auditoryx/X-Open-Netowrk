const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const uid = "MGBCYJHGVHXHXRXmUv8f64WCQuB2";

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Admin claim set for UID: ${uid}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error setting admin claim:", err);
    process.exit(1);
  });
