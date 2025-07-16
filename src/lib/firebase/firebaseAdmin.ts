import * as firebaseAdmin from 'firebase-admin';

let firestore: firebaseAdmin.firestore.Firestore | null = null;
let auth: firebaseAdmin.auth.Auth | null = null;

try {
  // Only initialize if all required environment variables are present
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    if (!firebaseAdmin.apps.length) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    firestore = firebaseAdmin.firestore();
    auth = firebaseAdmin.auth();
  } else {
    console.warn('Firebase Admin: Missing environment variables, skipping initialization');
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

export { firestore, auth };
export const getAuth = () => auth;
export default firebaseAdmin;
