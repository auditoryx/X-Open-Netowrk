import { app } from "@/firebase/firebaseConfig";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { logger } from "./logger";

const db = getFirestore(app);

export async function submitApplication({
  name,
  email,
  experience,
  role,
}: {
  name: string;
  email: string;
  experience: string;
  role: string;
}) {
  try {
    const docRef = await addDoc(collection(db, "submissions"), {
      name,
      email,
      experience,
      role,
      submittedAt: Timestamp.now(),
    });
    logger.info("Document written with ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (e) {
    logger.error("Error adding document:", e);
    return { success: false, error: e };
  }
}
