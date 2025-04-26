import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export async function saveMediaSamples(uid: string, samples: { type: string; url: string }[]) {
  const db = getFirestore(app)
  const userRef = doc(db, 'users', uid)

  await updateDoc(userRef, {
    mediaSamples: arrayUnion(...samples),
  })
}
