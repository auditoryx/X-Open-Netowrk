import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function setTypingStatus(bookingId: string, userId: string, isTyping: boolean) {
  const typingDocRef = doc(db, 'bookings', bookingId, 'typing', userId)
  if (isTyping) {
    await setDoc(typingDocRef, { timestamp: Date.now() })
  } else {
    await deleteDoc(typingDocRef)
  }
}
