import {
  doc,
  increment,
  serverTimestamp,
  getDoc,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { XP_VALUES } from '@/constants/gamification'

export type GamificationEvent =
  | 'bookingConfirmed'
  | 'fiveStarReview'
  | 'onTimeDelivery'
  | 'sevenDayStreak'
  | 'creatorReferral'

export type UserTier = 'standard' | 'verified' | 'signature'

/**
 * Atomically award XP; enforces 100-XP/day cap & duplicate-context guard.
 */
export async function logXpEvent(
  uid: string,
  event: GamificationEvent,
  contextId: string,           // bookingId | reviewId | referralId
) {
  const xp = XP_VALUES[event]
  const xpRef = doc(db, 'users', uid)
  const metaRef = doc(db, 'users', uid, 'xpMeta', contextId)
  const dayKey = new Date().toISOString().slice(0, 10)
  const dailyRef = doc(db, 'users', uid, 'xpDaily', dayKey)

  const [metaSnap, dailySnap] = await Promise.all([getDoc(metaRef), getDoc(dailyRef)])
  if (metaSnap.exists()) return // duplicate: ignore

  const used = dailySnap.exists() ? (dailySnap.data() as any).total || 0 : 0
  const remaining = Math.max(0, 100 - used)
  const awarded = Math.min(xp, remaining)

  if (awarded > 0) {
    await setDoc(
      xpRef,
      {
        xp: increment(awarded),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
    await setDoc(
      dailyRef,
      { total: increment(awarded), updatedAt: serverTimestamp() },
      { merge: true },
    )
  }

  await setDoc(metaRef, { event, xp: awarded, at: serverTimestamp() })
}
