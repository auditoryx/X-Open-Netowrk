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

async function notifyRecipient(
  recipientId: string,
  email: string | null,
  bookingId: string,
  senderId: string
) {
  await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: recipientId,
      email,
      type: 'message',
      title: 'New Message',
      message: `You have a new message in your booking with ${senderId}`,
      link: `/dashboard/bookings/${bookingId}`
    })
  })
}

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

  const userSnap = await getDoc(doc(db, 'users', recipientId))
  const email = userSnap.exists() ? (userSnap.data() as any).email || null : null

  // Send in-app notification to recipient
  await sendInAppNotification({
    to: recipientId,
    type: 'message',
    title: 'New Message',
    message: `You have a new message in your booking with ${senderId}`,
    link: `/dashboard/bookings/${bookingId}`
  })

  await notifyRecipient(recipientId, email, bookingId, senderId)
}
