import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { sendInAppNotification } from '@/lib/notifications/sendInAppNotification'

export async function sendMessage({
  bookingId,
  senderId,
  text
}: {
  bookingId: string
  senderId: string
  text: string
}) {
  const db = getFirestore(app)
  const ref = collection(db, 'bookings', bookingId, 'messages')

  // Send message
  await addDoc(ref, {
    senderId,
    text,
    createdAt: serverTimestamp(),
    seenBy: [senderId]
  })

  // Get booking to determine recipient
  const bookingSnap = await getDoc(doc(db, 'bookings', bookingId))
  if (!bookingSnap.exists()) return
  const booking = bookingSnap.data()
  const recipientId = booking.buyerId === senderId ? booking.providerId : booking.buyerId

  // Send in-app notification to recipient
  await sendInAppNotification({
    to: recipientId,
    type: 'message',
    title: 'New Message',
    message: `You have a new message in your booking with ${senderId}`,
    link: `/dashboard/bookings/${bookingId}`
  })
}
