import * as firebaseAdmin from 'firebase-admin';

if (!firebaseAdmin.apps.length) {
  try {
    // Only initialize if all required env vars are present
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      console.warn('Firebase Admin not initialized: missing environment variables');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

export default firebaseAdmin;
