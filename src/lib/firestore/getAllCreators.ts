import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export async function getAllCreators() {
  const db = getFirestore(app)
  const snapshot = await getDocs(collection(db, 'users'))

  return snapshot.docs
    .map((doc) => ({ uid: doc.id, ...doc.data() }))
    .filter((u) => u.isVisible !== false)
}
