import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export async function getAvailabilityTemplate(uid: string) {
  const db = getFirestore(app)
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  const data = snap.exists() ? snap.data() : {}
  return data.availability || {}
}
