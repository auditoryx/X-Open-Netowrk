import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export async function getTrustStats(uid: string) {
  const db = getFirestore(app)

  const bookingsRef = collection(db, 'bookings')
  const bookingsSnap = await getDocs(query(bookingsRef, where('providerId', '==', uid), where('status', '==', 'completed')))
  const total = bookingsSnap.size

  const reviewsRef = collection(db, 'reviews')
  const reviewsSnap = await getDocs(query(reviewsRef, where('providerId', '==', uid)))
  const reviews = reviewsSnap.docs.map((d) => d.data())
  const rating = reviews.length
    ? reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length
    : 0

  return { total, rating }
}
