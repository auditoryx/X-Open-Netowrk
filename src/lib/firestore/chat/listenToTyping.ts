import { db } from '@/lib/firebase'
import {
  collection,
  onSnapshot
} from 'firebase/firestore'

type TypingCallback = (typingUsers: string[]) => void

export function listenToTyping(bookingId: string, callback: TypingCallback) {
  const typingRef = collection(db, 'bookings', bookingId, 'typing')

  return onSnapshot(typingRef, (snapshot) => {
    const typingUsers: string[] = []
    snapshot.forEach((doc) => {
      typingUsers.push(doc.id)
    })
    callback(typingUsers)
  })
}
