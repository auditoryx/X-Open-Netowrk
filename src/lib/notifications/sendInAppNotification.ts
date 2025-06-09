import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
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
  const ref = doc(db, 'notifications', to)
  await setDoc(ref, {
    userId: to,
    type,
    title,
    message,
    link,
    seen: false,
    createdAt: serverTimestamp()
  })
}
