import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUHHus8UIz1KPrQMLIc4MSZrDoHzejyPA",
  authDomain: "auditory-x-open-network.firebaseapp.com",
  projectId: "auditory-x-open-network",
  storageBucket: "auditory-x-open-network.appspot.com",
  messagingSenderId: "827240797874",
  appId: "1:827240797874:web:28e35367b510a4a34c1bab",
  measurementId: "G-T4JEJCW28T"
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
