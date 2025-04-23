import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUHHus8UIz1KPrQMLIc4MSZrDoHzejyPA",
  authDomain: "auditory-x-open-network.firebaseapp.com",
  projectId: "auditory-x-open-network",
  storageBucket: "auditory-x-open-network.firebasestorage.app",
  messagingSenderId: "827240797874",
  appId: "1:827240797874:web:28e35367b510a4a34c1bab",
  measurementId: "G-T4JEJCW28T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
