import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp({
  credential: applicationDefault(),
  projectId: 'auditory-x-open-network', // 👈 add this line explicitly
});

const uid = 'vod7NQH7FPNZktFg39ZJVwLaVS22';

getAuth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Admin claim set for UID: ${uid}`);
  })
  .catch((error) => {
    console.error('❌ Failed to set admin claim:', error);
  });
