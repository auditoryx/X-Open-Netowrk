const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const uid = "MGBCYJHGVHXHXRXmUv8f64WCQuB2"; // zenji@auditoryx.com
const role = "admin";

admin.auth().setCustomUserClaims(uid, { admin: true, role })
  .then(() => {
    console.log(`✅ Admin and role "${role}" set for UID: ${uid}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error setting role claim:", err);
    process.exit(1);
  });
