import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
import fs from 'fs';
const profiles = JSON.parse(fs.readFileSync(new URL('../data/profiles.json', import.meta.url)))

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


async function seed() {
  await Promise.all(
    profiles.map(p => setDoc(doc(db, 'profiles', String(p.id)), p))
  );
  console.log('🔥 Seeded profile data');
  process.exit(0);
}

seed();
