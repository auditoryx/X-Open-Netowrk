import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from '../app/firebase.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const profiles = [
  {
    id: 'artist123',
    name: 'Jay Wavez',
    role: 'Artist',
    location: 'Tokyo, Japan',
    bio: 'Independent hip-hop artist blending cultures.',
    portfolio: 'https://jaywavez.com',
    image: 'https://source.unsplash.com/random/800x400?artist'
  },
  {
    id: 'studio001',
    name: 'Skyline Studios',
    role: 'Studio',
    location: 'Shibuya, Tokyo',
    bio: 'Premium recording studio for modern sound.',
    portfolio: 'https://skyline-studios.jp',
    image: 'https://source.unsplash.com/random/800x400?studio'
  }
];

async function seed() {
  await Promise.all(
    profiles.map(p => setDoc(doc(db, 'profiles', p.id), p))
  );
  console.log('🔥 Seeded profile data');
  process.exit(0);
}

seed();
