import { chromium } from '@playwright/test';
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

/**
 * Global setup for Playwright tests
 * Sets up Firebase emulators and test data
 */
async function globalSetup() {
  console.log('🚀 Starting global test setup...');

  // Initialize Firebase for testing
  const firebaseConfig = {
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id'
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // Connect to emulators if not already connected
  try {
    if (process.env.NODE_ENV === 'test' || process.env.CI) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectAuthEmulator(auth, 'http://localhost:9099');
      console.log('📡 Connected to Firebase emulators');
    }
  } catch (error) {
    console.log('📡 Firebase emulators already connected or not available');
  }

  // Set up test environment variables
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR = 'true';
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789';
  process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
  process.env.SENDGRID_API_KEY = 'test-sendgrid-key';

  // Launch browser for shared state
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  // Store browser instance globally
  (global as any).__BROWSER__ = browser;
  (global as any).__CONTEXT__ = context;

  console.log('✅ Global test setup completed');
}

export default globalSetup;
