import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { app } from '@/lib/firebase'

type Review = {
  bookingId: string
  providerId: string
  clientId: string
  text: string
  rating: number
}

export async function submitReview(review: Review) {
  const db = getFirestore(app)
  const ref = collection(db, 'reviews')
  await addDoc(ref, {
    ...review,
    createdAt: serverTimestamp(),
  })
}
