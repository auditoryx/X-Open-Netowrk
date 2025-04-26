import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export async function sendMessage({ bookingId, senderId, text }: { bookingId: string; senderId: string; text: string }) {
  const db = getFirestore(app)
  const ref = collection(db, 'bookings', bookingId, 'messages')
  await addDoc(ref, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  })
}
