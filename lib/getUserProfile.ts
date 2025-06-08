import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";
import { logger } from "./logger";

const db = getFirestore(app);

export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;

    const data = userSnap.data();
    return {
      ...data,
      contactOnlyViaRequest: data.contactOnlyViaRequest ?? false,
    };
  } catch (error) {
    logger.error("Error fetching user profile:", error);
    return null;
  }
};
