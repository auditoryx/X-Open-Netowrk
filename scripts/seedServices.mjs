import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const services = [
  {
    id: "studio-001",
    title: "Skyline Recording Studio",
    description: "High-end studio in Shibuya for full mixes and vocal tracking.",
    price: 150
  },
  {
    id: "producer-001",
    title: "J-Wavez (Producer)",
    description: "Trap beats, rage, pluggnb, and hyperpop — industry ready.",
    price: 100
  }
];

Promise.all(
  services.map((s) => setDoc(doc(db, 'services', s.id), s))
).then(() => {
  console.log('🔥 Seeded sample services');
});
