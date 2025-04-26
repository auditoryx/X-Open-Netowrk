import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export async function saveAvailabilityTemplate(uid: string, data: Record<string, string>) {
  const db = getFirestore(app)
  const ref = doc(db, 'users', uid)
  await setDoc(ref, { availability: data }, { merge: true })
}
