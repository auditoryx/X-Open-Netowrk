import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
  runTransaction,
  increment,
} from 'firebase/firestore'

/**
 * XP Service for AuditoryX Gamification System
 * Handles XP earning, tracking, and anti-gaming measures
 */

// XP Values as per blueprint
export const XP_VALUES = {
  bookingCompleted: 100,
  fiveStarReview: 30,
  referralSignup: 100,
  referralFirstBooking: 50,
  profileCompleted: 25,
  // Legacy values for backward compatibility
  bookingConfirmed: 50,
  onTimeDelivery: 25,
  sevenDayStreak: 40,
  creatorReferral: 150,
} as const

export type XPEvent = keyof typeof XP_VALUES

// Daily XP cap as per blueprint
export const DAILY_XP_CAP = 300

// XP Transaction record for audit logging
export interface XPTransaction {
  id?: string
  userId: string
  event: XPEvent
  xpAwarded: number
  contextId?: string
  metadata?: Record<string, any>
  timestamp: Timestamp
  dailyCapReached?: boolean
}

// User Progress schema for userProgress collection
export interface UserProgress {
  userId: string
  totalXP: number
  dailyXP: number
  lastXPDate: Timestamp
  streak: number
  lastActivityAt: Timestamp
  tier: 'standard' | 'verified' | 'signature'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export class XPService {
  private static instance: XPService
  
  private constructor() {}
  
  static getInstance(): XPService {
    if (!XPService.instance) {
      XPService.instance = new XPService()
    }
    return XPService.instance
  }

  /**
   * Award XP to a user for a specific event
   * Handles daily cap enforcement and duplicate prevention
   */
  async awardXP(
    userId: string,
    event: XPEvent,
    options: {
      contextId?: string
      metadata?: Record<string, any>
      skipDuplicateCheck?: boolean
    } = {}
  ): Promise<{
    success: boolean
    xpAwarded: number
    dailyCapReached: boolean
    message: string
  }> {
    try {
      const result = await runTransaction(db, async (transaction) => {
        // Check for duplicates if contextId provided
        if (options.contextId && !options.skipDuplicateCheck) {
          const duplicateExists = await this.checkDuplicateTransaction(
            userId,
            event,
            options.contextId
          )
          if (duplicateExists) {
            await this.logSuspiciousActivity(userId, event, options.contextId)
            return {
              success: false,
              xpAwarded: 0,
              dailyCapReached: false,
              message: 'Duplicate transaction detected'
            }
          }
        }

        // Get user progress
        const userProgressRef = doc(db, 'userProgress', userId)
        const userProgressSnap = await transaction.get(userProgressRef)
        
        let userProgress: UserProgress
        const now = Timestamp.now()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayTimestamp = Timestamp.fromDate(today)

        if (!userProgressSnap.exists()) {
          // Create new user progress
          userProgress = {
            userId,
            totalXP: 0,
            dailyXP: 0,
            lastXPDate: todayTimestamp,
            streak: 0,
            lastActivityAt: now,
            tier: 'standard',
            createdAt: now,
            updatedAt: now
          }
        } else {
          userProgress = userProgressSnap.data() as UserProgress
          
          // Reset daily XP if it's a new day
          if (userProgress.lastXPDate.toDate() < today) {
            userProgress.dailyXP = 0
            userProgress.lastXPDate = todayTimestamp
          }
        }

        // Calculate XP to award
        const baseXP = XP_VALUES[event]
        const remainingDailyCap = Math.max(0, DAILY_XP_CAP - userProgress.dailyXP)
        const xpToAward = Math.min(baseXP, remainingDailyCap)
        
        const dailyCapReached = xpToAward < baseXP

        // Update user progress
        const updatedProgress: UserProgress = {
          ...userProgress,
          totalXP: userProgress.totalXP + xpToAward,
          dailyXP: userProgress.dailyXP + xpToAward,
          lastActivityAt: now,
          updatedAt: now
        }

        // Save user progress
        transaction.set(userProgressRef, updatedProgress)

        // Log XP transaction
        const transactionRef = doc(collection(db, 'xpTransactions'))
        const xpTransaction: XPTransaction = {
          userId,
          event,
          xpAwarded: xpToAward,
          contextId: options.contextId,
          metadata: options.metadata,
          timestamp: now,
          dailyCapReached
        }
        transaction.set(transactionRef, xpTransaction)

        return {
          success: true,
          xpAwarded: xpToAward,
          dailyCapReached,
          message: dailyCapReached 
            ? `Awarded ${xpToAward} XP (daily cap reached)`
            : `Awarded ${xpToAward} XP`
        }
      })

      return result
    } catch (error) {
      console.error('Error awarding XP:', error)
      return {
        success: false,
        xpAwarded: 0,
        dailyCapReached: false,
        message: 'Error awarding XP'
      }
    }
  }

  /**
   * Get user's current XP and progress
   */
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const userProgressRef = doc(db, 'userProgress', userId)
      const userProgressSnap = await getDoc(userProgressRef)
      
      if (!userProgressSnap.exists()) {
        return null
      }

      const userProgress = userProgressSnap.data() as UserProgress
      
      // Reset daily XP if it's a new day
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (userProgress.lastXPDate.toDate() < today) {
        const updatedProgress = {
          ...userProgress,
          dailyXP: 0,
          lastXPDate: Timestamp.fromDate(today),
          updatedAt: Timestamp.now()
        }
        
        await updateDoc(userProgressRef, updatedProgress)
        return updatedProgress
      }

      return userProgress
    } catch (error) {
      console.error('Error getting user progress:', error)
      return null
    }
  }

  /**
   * Get user's XP transaction history
   */
  async getUserXPHistory(
    userId: string,
    limit: number = 50
  ): Promise<XPTransaction[]> {
    try {
      const q = query(
        collection(db, 'xpTransactions'),
        where('userId', '==', userId)
      )
      
      const querySnapshot = await getDocs(q)
      const transactions: XPTransaction[] = []
      
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() } as XPTransaction)
      })
      
      // Sort by timestamp descending
      transactions.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
      
      return transactions.slice(0, limit)
    } catch (error) {
      console.error('Error getting XP history:', error)
      return []
    }
  }

  /**
   * Check if a transaction already exists (duplicate prevention)
   */
  private async checkDuplicateTransaction(
    userId: string,
    event: XPEvent,
    contextId: string
  ): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'xpTransactions'),
        where('userId', '==', userId),
        where('event', '==', event),
        where('contextId', '==', contextId)
      )
      
      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (error) {
      console.error('Error checking duplicate transaction:', error)
      return false
    }
  }

  /**
   * Log suspicious activity for admin review
   */
  private async logSuspiciousActivity(
    userId: string,
    event: XPEvent,
    contextId: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'suspiciousActivity'), {
        userId,
        event,
        contextId,
        type: 'duplicate_xp_attempt',
        timestamp: serverTimestamp(),
        reviewed: false
      })
    } catch (error) {
      console.error('Error logging suspicious activity:', error)
    }
  }

  /**
   * Admin function to manually adjust XP
   */
  async adminAdjustXP(
    userId: string,
    xpChange: number,
    reason: string,
    adminId: string
  ): Promise<boolean> {
    try {
      await runTransaction(db, async (transaction) => {
        const userProgressRef = doc(db, 'userProgress', userId)
        const userProgressSnap = await transaction.get(userProgressRef)
        
        if (!userProgressSnap.exists()) {
          throw new Error('User progress not found')
        }

        const userProgress = userProgressSnap.data() as UserProgress
        const newTotalXP = Math.max(0, userProgress.totalXP + xpChange)
        
        // Update user progress
        transaction.update(userProgressRef, {
          totalXP: newTotalXP,
          updatedAt: Timestamp.now()
        })

        // Log admin action
        const adminActionRef = doc(collection(db, 'adminActions'))
        transaction.set(adminActionRef, {
          type: 'xp_adjustment',
          adminId,
          targetUserId: userId,
          xpChange,
          reason,
          timestamp: serverTimestamp()
        })
      })

      return true
    } catch (error) {
      console.error('Error adjusting XP:', error)
      return false
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(limit: number = 10): Promise<Array<{
    userId: string
    totalXP: number
    tier: string
  }>> {
    try {
      const q = query(collection(db, 'userProgress'))
      const querySnapshot = await getDocs(q)
      
      const leaderboard: Array<{
        userId: string
        totalXP: number
        tier: string
      }> = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as UserProgress
        leaderboard.push({
          userId: data.userId,
          totalXP: data.totalXP,
          tier: data.tier
        })
      })
      
      // Sort by total XP descending
      leaderboard.sort((a, b) => b.totalXP - a.totalXP)
      
      return leaderboard.slice(0, limit)
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }
}

// Export singleton instance
export const xpService = XPService.getInstance()
