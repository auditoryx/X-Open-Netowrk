import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAUHHus8UIz1KPrQMLIc4MSZrDoHzejyPA",
  authDomain: "auditory-x-open-network.firebaseapp.com",
  projectId: "auditory-x-open-network",
  storageBucket: "auditory-x-open-network.firebasestorage.app",
  messagingSenderId: "827240797874",
  appId: "1:827240797874:web:28e35367b510a4a34c1bab",
  measurementId: "G-T4JEJCW28T"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
