import { db } from '@/lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { sendEmail } from '@/lib/email/sendEmail'

export type NotificationPayload = Record<string, any>

export async function sendInAppAndEmail({
  toUid,
  type,
  payload
}: {
  toUid: string
  type: string
  payload: NotificationPayload
}) {
  await addDoc(collection(db, 'notifications', toUid), {
    type,
    ...payload,
    createdAt: serverTimestamp(),
    seen: false
  })

  if (
    payload.email &&
    process.env.SMTP_EMAIL &&
    process.env.SMTP_PASS &&
    payload.subject &&
    payload.template
  ) {
    await sendEmail(
      payload.email,
      payload.subject,
      payload.template,
      payload.data || {}
    )
  }
}
