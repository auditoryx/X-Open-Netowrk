import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app;
let adminDb;

// Check if we should skip Firebase initialization (for build process)
if (process.env.SKIP_FIREBASE_INIT === 'true') {
  console.log('Firebase Admin: Skipping initialization (SKIP_FIREBASE_INIT=true)');
  app = null;
  adminDb = null;
} else {
  // Prevent Firebase initialization during build process
  try {
    // Only initialize if all required environment variables are present and we're not in build
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY &&
      // Ensure private key looks like a valid PEM format (and not a mock)
      process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY') &&
      !process.env.FIREBASE_PRIVATE_KEY.includes('MOCK') &&
      !process.env.FIREBASE_PRIVATE_KEY.includes('BUILD_PURPOSES')
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
      console.warn('Firebase Admin: Missing, invalid, or mock environment variables - running in safe mode');
      app = null;
      adminDb = null;
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Don't throw error during build/development - allow graceful degradation
    console.warn('Firebase Admin will not be available - some features may not work');
    app = null;
    adminDb = null;
  }
}

// Safe exports that won't break during build
export { app as admin, adminDb };

// Add a helper function to check if Firebase admin is available
export function isAdminAvailable(): boolean {
  return app !== null && adminDb !== null;
}

// Safe wrapper for admin operations
export function withAdmin<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  if (!isAdminAvailable()) {
    console.warn('Firebase Admin not available, using fallback');
    return Promise.resolve(fallback);
  }
  return operation();
}
