import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from '../app/firebase.js';
import profiles from '../data/profiles.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


async function seed() {
  await Promise.all(
    profiles.map(p => setDoc(doc(db, 'profiles', p.id), p))
  );
  console.log('🔥 Seeded profile data');
  process.exit(0);
}

seed();
