const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert('<PATH/TO/KEY.json>')
});
const UID = '<MGBCYJHGVHXHXRXmUv8f64WCQuB2>';
admin.auth().setCustomUserClaims(UID, { admin: true })
  .then(() => {
    console.log(\`✅ Admin claim granted to user \${UID}\`);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
