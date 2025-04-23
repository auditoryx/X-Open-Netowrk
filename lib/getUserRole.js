import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export async function getUserRole(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data().role || null;
  }
  return null;
}
