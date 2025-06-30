import { db } from '@/lib/firebase'
import { collection, addDoc, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { sendDisputeEmail } from '@/lib/email/sendDisputeEmail'
import { logActivity } from '@/lib/firestore/logging/logActivity'
import { z } from 'zod'
import { sendInAppAndEmail } from '@/lib/notifications/sendInAppAndEmail'

async function notifyAdmin(bookingId: string, fromUser: string, reason: string) {
  const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL || null
  await sendInAppAndEmail({
    toUid: 'admin-notify',
    type: 'dispute',
    payload: {
      title: 'New Dispute Filed',
      message: `A dispute was filed for booking ${bookingId}`,
      link: `/admin/disputes`,
      ...(email
        ? {
            email,
            subject: 'New Dispute Filed',
            template: 'dispute-notification.html',
            data: { bookingId, fromUser, reason }
          }
        : {})
    }
  })
}

const disputeSchema = z.object({
  bookingId: z.string().min(1),
  fromUser: z.string().min(1),
  reason: z.string().min(5),
  clientId: z.string().min(1).optional(),
  providerId: z.string().min(1).optional(),
})

export async function createDispute(input: unknown) {
  const parsed = disputeSchema.safeParse(input)
  if (!parsed.success) {
    console.error('Invalid dispute submission:', parsed.error.format())
    return { error: 'Invalid dispute data' }
  }

  const { bookingId, fromUser, reason, clientId, providerId } = parsed.data

  if (!clientId || !providerId) {
    const bookingSnap = await getDoc(doc(db, 'bookings', bookingId))
    const bookingData = bookingSnap.data() || {}
    clientId = clientId || bookingData.clientId || bookingData.clientUid
    providerId = providerId || bookingData.providerId || bookingData.providerUid
  }

  if (!clientId || !providerId) {
    console.warn('Dispute missing client or provider ID for booking:', bookingId)
    return { error: 'Associated booking not found' }
  }

  // 🧯 Anti-Spam: Limit 1 dispute per 60 seconds per user
  const cooldownRef = doc(db, 'disputeCooldowns', fromUser)
  const cooldownSnap = await getDoc(cooldownRef)

  if (cooldownSnap.exists()) {
    const lastSent = cooldownSnap.data().timestamp?.toMillis() || 0
    const now = Date.now()

    if (now - lastSent < 60_000) {
      console.warn('Dispute submission throttled for user:', fromUser)
      return { error: 'You must wait before submitting another dispute.' }
    }
  }

  try {
    await addDoc(collection(db, 'disputes'), {
      bookingId,
      fromUser,
      reason,
      clientId,
      providerId,
      status: 'open',
      createdAt: Timestamp.now(),
    })

    await setDoc(cooldownRef, {
      timestamp: Timestamp.now()
    })

    await sendDisputeEmail(bookingId, fromUser, reason)
    await notifyAdmin(bookingId, fromUser, reason)
    await logActivity(fromUser, 'dispute_opened', { bookingId, reason })

    return { success: true }
  } catch (err: any) {
    console.error('Error creating dispute:', err.message)
    return { error: 'Dispute could not be submitted.' }
  }
}
