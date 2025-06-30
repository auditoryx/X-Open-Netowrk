import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export async function getUserBookings(uid: string) {
  const db = getFirestore(app)
  const bookingsRef = collection(db, 'bookings')
  const q = query(bookingsRef, where('providerId', '==', uid), where('status', '!=', 'cancelled'))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => doc.data()) as { date: string; time: string }[]
}
