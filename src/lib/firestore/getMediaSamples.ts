import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export async function getMediaSamples(uid: string) {
  const db = getFirestore(app)
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)

  const data = snap.exists() ? snap.data() : {}
  return data.mediaSamples || []
}
