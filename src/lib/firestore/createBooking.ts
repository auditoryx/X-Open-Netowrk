import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { app } from '@/lib/firebase'

type BookingData = {
  clientId: string
  providerId: string
  date: string
  time: string
  note?: string
}

export async function createBooking(data: BookingData) {
  const db = getFirestore(app)
  const ref = collection(db, 'bookings')
  await addDoc(ref, {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}
