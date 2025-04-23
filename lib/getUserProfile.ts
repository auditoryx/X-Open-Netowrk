import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";

const db = getFirestore(app);

export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};
