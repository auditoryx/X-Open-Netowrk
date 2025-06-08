import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore'
import { app } from '@/lib/firebase'

export async function markConversationMessagesAsSeen(convoId: string, uid: string) {
  const db = getFirestore(app)
  const q = query(
    collection(db, 'conversations', convoId, 'messages'),
    orderBy('timestamp', 'desc'),
    limit(50)
  )
  const snap = await getDocs(q)

  const updates = snap.docs.filter(d => {
    const data = d.data()
    return !data.seenBy?.includes(uid)
  })

  for (const docRef of updates) {
    await updateDoc(doc(db, 'conversations', convoId, 'messages', docRef.id), {
      seenBy: [...(docRef.data().seenBy || []), uid]
    })
  }
}
