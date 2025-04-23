const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const uid = "vod7NQH7FPNZktFg39ZJVwLaVS22"; // zenhrtx@gmail.com
const role = "artist";

admin.auth().setCustomUserClaims(uid, { role })
  .then(() => {
    console.log(`✅ Role "${role}" set for UID: ${uid}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error setting role claim:", err);
    process.exit(1);
  });
