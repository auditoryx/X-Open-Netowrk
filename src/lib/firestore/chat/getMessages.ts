import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export async function getMessages(bookingId: string) {
  const db = getFirestore(app)
  const ref = collection(db, 'bookings', bookingId, 'messages')
  const q = query(ref, orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((doc) => doc.data())
}
