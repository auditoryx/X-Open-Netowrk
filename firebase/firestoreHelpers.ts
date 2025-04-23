import { db } from "./firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function submitApplication(role: string, name: string, email: string, bio: string) {
  try {
    await addDoc(collection(db, "applications"), {
      role,
      name,
      email,
      bio,
      submittedAt: Timestamp.now(),
      status: "pending"
    });
  } catch (error) {
    console.error("Failed to submit application:", error);
    throw error;
  }
}
