import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type NotificationType =
  | 'message'
  | 'booking'
  | 'review'
  | 'dispute'

export async function sendInAppNotification({
  to,
  type,
  title,
  message,
  link
}: {
  to: string
  type: NotificationType
  title: string
  message: string
  link: string
}) {
  await addDoc(collection(db, 'users', to, 'notifications'), {
    type,
    title,
    message,
    link,
    seen: false,
    createdAt: serverTimestamp()
  })
}
