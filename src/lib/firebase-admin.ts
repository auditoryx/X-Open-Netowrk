import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app;
let adminDb;

try {
  // Only initialize if all required environment variables are present
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    app = getApps().length
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });

    adminDb = getFirestore(app);
  } else {
    console.warn('Firebase Admin: Missing environment variables, skipping initialization');
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

export { app as admin, adminDb };
