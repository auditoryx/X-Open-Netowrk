import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { XP_VALUES } from '@/constants/gamification'

/** Creator tier type used in ranking calculations. */
export type UserTier = 'standard' | 'verified' | 'signature'

/** Maximum XP a user can earn in a single day. */
export const DAILY_XP_CAP = 100

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Valid event keys that can award XP. Maintained alongside
 * `XP_VALUES` so each event has a numeric reward.
 */
export type GamificationEvent = keyof typeof XP_VALUES

export interface LogOptions {
  quickReply?: boolean
  /** Optional id used to deduplicate events (e.g. booking or message id) */
  contextId?: string
}

/**
 * Record an XP earning event for a user.
 *
 * Returns the amount of XP actually awarded after
 * enforcing the daily cap and duplicate checks.
 */
export async function logXpEvent(
  uid: string,
  event: GamificationEvent,
  options: LogOptions = {}
) {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  const userData = userSnap.exists() ? (userSnap.data() as any) : {}

  const now = Date.now()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const activitiesRef = collection(db, 'users', uid, 'activities')
  if (options.contextId) {
    const dupQ = query(activitiesRef, where('contextId', '==', options.contextId))
    const dupSnap = await getDocs(dupQ)
    if (!dupSnap.empty) {
      await addDoc(collection(db, 'abuseLogs'), {
        uid,
        event,
        contextId: options.contextId,
        createdAt: serverTimestamp(),
      })
      return 0
    }
  }
  const q = query(activitiesRef, where('createdAt', '>=', Timestamp.fromDate(start)))
  const todaySnap = await getDocs(q)
  const earnedToday = todaySnap.docs.reduce((sum, d) => sum + (d.data().xp || 0), 0)

  const remaining = Math.max(0, DAILY_XP_CAP - earnedToday)
  const xp = XP_VALUES[event]
  const awarded = Math.min(xp, remaining)

  await addDoc(activitiesRef, {
    xp: awarded,
    event,
    contextId: options.contextId,
    createdAt: serverTimestamp(),
  })

  const last = userData.lastActivityAt?.toMillis
    ? userData.lastActivityAt.toMillis()
    : userData.lastActivityAt
      ? new Date(userData.lastActivityAt).getTime()
      : undefined
  let streak = userData.streakCount || 0
  if (options.quickReply) {
    if (last && now - last < DAY_MS) {
      streak += 1
    } else {
      streak = 1
    }
  } else if (!last || now - last >= DAY_MS) {
    streak = 0
  }

  await updateDoc(userRef, {
    xp: (userData.xp || 0) + awarded,
    streakCount: streak,
    lastActivityAt: serverTimestamp(),
  })

  return awarded
}
