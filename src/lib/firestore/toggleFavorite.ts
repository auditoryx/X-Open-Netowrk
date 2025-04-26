import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export async function toggleFavorite(uid: string, creatorId: string, save: boolean) {
  const db = getFirestore(app)
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, {
    favorites: save ? arrayUnion(creatorId) : arrayRemove(creatorId),
  })
}
