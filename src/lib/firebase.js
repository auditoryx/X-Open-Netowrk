import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUHHus8UIz1KPrQMLIc4MSZrDoHzejyPA",
  authDomain: "auditory-x-open-network.firebaseapp.com",
  projectId: "auditory-x-open-network",
  storageBucket: "auditory-x-open-network.appspot.com",
  messagingSenderId: "827240797874",
  appId: "1:827240797874:web:28e35367b510a4a34c1bab",
  measurementId: "G-T4JEJCW28T"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
