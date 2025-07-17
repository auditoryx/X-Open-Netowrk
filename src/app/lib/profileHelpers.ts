import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

export async function saveUserProfile(uid: string, data: Record<string, any>): Promise<void> {
  const db = getFirestore(app);
  await setDoc(doc(db, "profiles", uid), {
    ...data,
    updatedAt: new Date(),
  });
}
