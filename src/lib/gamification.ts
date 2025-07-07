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
import { xpService } from '@/lib/services/xpService'

/** Creator tier type used in ranking calculations. */
export type UserTier = 'standard' | 'verified' | 'signature'

/** Maximum XP a user can earn in a single day. */
export const DAILY_XP_CAP = 300 // Updated to match blueprint

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
 * @deprecated Use xpService.awardXP() instead for new implementations
 * This function is maintained for backward compatibility
 *
 * Returns the amount of XP actually awarded after
 * enforcing the daily cap and duplicate checks.
 */
export async function logXpEvent(
  uid: string,
  event: GamificationEvent,
  options: LogOptions = {}
) {
  try {
    // Use new XP service for consistency
    const result = await xpService.awardXP(uid, event, {
      contextId: options.contextId,
      metadata: { quickReply: options.quickReply }
    })
    
    // Handle legacy streak logic if quickReply is specified
    if (options.quickReply && result.success) {
      await updateUserStreak(uid)
    }
    
    return result.xpAwarded
  } catch (error) {
    console.error('Error in logXpEvent:', error)
    return 0
  }
}

/**
 * Update user streak for quick reply events
 * @deprecated This logic will be moved to the new XP service in future versions
 */
async function updateUserStreak(uid: string) {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return
    }
    
    const userData = userSnap.data()
    const now = Date.now()
    
    const last = userData.lastActivityAt?.toMillis
      ? userData.lastActivityAt.toMillis()
      : userData.lastActivityAt
        ? new Date(userData.lastActivityAt).getTime()
        : undefined
    
    let streak = userData.streakCount || 0
    
    if (last && now - last < DAY_MS) {
      streak += 1
    } else {
      streak = 1
    }
    
    await updateDoc(userRef, {
      streakCount: streak,
      lastActivityAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating user streak:', error)
  }
}
