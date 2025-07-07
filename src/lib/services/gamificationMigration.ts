import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore'
import { UserProgress } from '@/lib/services/xpService'

/**
 * Migration script to transition from old gamification system to new XP service
 * Run this script once to migrate existing user data
 */

interface LegacyUserData {
  xp?: number
  streakCount?: number
  lastActivityAt?: any
  tier?: 'standard' | 'verified' | 'signature'
}

interface ActivityData {
  xp: number
  event: string
  contextId?: string
  createdAt: any
}

export class GamificationMigration {
  private static instance: GamificationMigration
  
  private constructor() {}
  
  static getInstance(): GamificationMigration {
    if (!GamificationMigration.instance) {
      GamificationMigration.instance = new GamificationMigration()
    }
    return GamificationMigration.instance
  }

  /**
   * Migrate all users from old system to new userProgress collection
   */
  async migrateAllUsers(): Promise<{
    migrated: number
    errors: number
    skipped: number
  }> {
    console.log('Starting gamification migration...')
    
    let migrated = 0
    let errors = 0
    let skipped = 0
    
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'))
      
      for (const userDoc of usersSnapshot.docs) {
        try {
          const userId = userDoc.id
          const userData = userDoc.data() as LegacyUserData
          
          // Check if user already has progress record
          const progressRef = doc(db, 'userProgress', userId)
          const progressSnap = await getDoc(progressRef)
          
          if (progressSnap.exists()) {
            console.log(`Skipping user ${userId} - already migrated`)
            skipped++
            continue
          }
          
          // Migrate user data
          await this.migrateUser(userId, userData)
          migrated++
          
          console.log(`Migrated user ${userId}`)
        } catch (error) {
          console.error(`Error migrating user ${userDoc.id}:`, error)
          errors++
        }
      }
    } catch (error) {
      console.error('Error during migration:', error)
      throw error
    }
    
    console.log(`Migration complete: ${migrated} migrated, ${errors} errors, ${skipped} skipped`)
    
    return { migrated, errors, skipped }
  }

  /**
   * Migrate a single user's data
   */
  async migrateUser(userId: string, userData: LegacyUserData): Promise<void> {
    const now = Timestamp.now()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Calculate daily XP from activities
    const dailyXP = await this.calculateDailyXP(userId)
    
    // Create user progress record
    const userProgress: UserProgress = {
      userId,
      totalXP: userData.xp || 0,
      dailyXP,
      lastXPDate: Timestamp.fromDate(today),
      streak: userData.streakCount || 0,
      lastActivityAt: userData.lastActivityAt ? 
        (userData.lastActivityAt.seconds ? userData.lastActivityAt : Timestamp.fromDate(new Date(userData.lastActivityAt))) 
        : now,
      tier: userData.tier || 'standard',
      createdAt: now,
      updatedAt: now
    }
    
    // Save to userProgress collection
    const progressRef = doc(db, 'userProgress', userId)
    await setDoc(progressRef, userProgress)
    
    // Migrate activity history to xpTransactions
    await this.migrateUserActivities(userId)
  }

  /**
   * Calculate daily XP for a user from their activities
   */
  private async calculateDailyXP(userId: string): Promise<number> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const activitiesRef = collection(db, 'users', userId, 'activities')
      const q = query(
        activitiesRef,
        where('createdAt', '>=', Timestamp.fromDate(today))
      )
      
      const activitiesSnapshot = await getDocs(q)
      let dailyXP = 0
      
      activitiesSnapshot.forEach((doc) => {
        const activity = doc.data() as ActivityData
        dailyXP += activity.xp || 0
      })
      
      return dailyXP
    } catch (error) {
      console.error(`Error calculating daily XP for user ${userId}:`, error)
      return 0
    }
  }

  /**
   * Migrate user activities to XP transactions
   */
  private async migrateUserActivities(userId: string): Promise<void> {
    try {
      const activitiesRef = collection(db, 'users', userId, 'activities')
      const q = query(activitiesRef, orderBy('createdAt', 'desc'), limit(100))
      
      const activitiesSnapshot = await getDocs(q)
      const batch = writeBatch(db)
      
      activitiesSnapshot.forEach((activityDoc) => {
        const activity = activityDoc.data() as ActivityData
        
        // Create XP transaction record
        const transactionRef = doc(collection(db, 'xpTransactions'))
        batch.set(transactionRef, {
          userId,
          event: activity.event,
          xpAwarded: activity.xp,
          contextId: activity.contextId,
          metadata: { migratedFromLegacy: true },
          timestamp: activity.createdAt,
          dailyCapReached: false
        })
      })
      
      await batch.commit()
    } catch (error) {
      console.error(`Error migrating activities for user ${userId}:`, error)
    }
  }

  /**
   * Verify migration integrity
   */
  async verifyMigration(): Promise<{
    totalUsers: number
    migratedUsers: number
    missingUsers: string[]
  }> {
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const progressSnapshot = await getDocs(collection(db, 'userProgress'))
    
    const userIds = new Set(usersSnapshot.docs.map(doc => doc.id))
    const progressIds = new Set(progressSnapshot.docs.map(doc => doc.id))
    
    const missingUsers: string[] = []
    
    for (const userId of userIds) {
      if (!progressIds.has(userId)) {
        missingUsers.push(userId)
      }
    }
    
    return {
      totalUsers: userIds.size,
      migratedUsers: progressIds.size,
      missingUsers
    }
  }

  /**
   * Clean up old data after successful migration (use with caution)
   */
  async cleanupLegacyData(): Promise<void> {
    console.log('WARNING: This will permanently delete legacy XP data!')
    console.log('Make sure migration is verified before running this.')
    
    // This would remove xp, streakCount fields from users collection
    // and delete activities subcollections
    // Implementation left intentionally incomplete for safety
    throw new Error('Cleanup not implemented - manual verification required')
  }
}

// Export singleton instance
export const migrationService = GamificationMigration.getInstance()

// Script runner function
export async function runMigration() {
  try {
    const migration = GamificationMigration.getInstance()
    
    console.log('🚀 Starting gamification system migration...')
    
    // Run migration
    const result = await migration.migrateAllUsers()
    
    console.log('📊 Migration Results:')
    console.log(`  ✅ Successfully migrated: ${result.migrated} users`)
    console.log(`  ⚠️  Errors: ${result.errors} users`)
    console.log(`  ⏭️  Skipped (already migrated): ${result.skipped} users`)
    
    // Verify migration
    console.log('\n🔍 Verifying migration...')
    const verification = await migration.verifyMigration()
    
    console.log('📋 Verification Results:')
    console.log(`  Total users: ${verification.totalUsers}`)
    console.log(`  Migrated users: ${verification.migratedUsers}`)
    console.log(`  Missing users: ${verification.missingUsers.length}`)
    
    if (verification.missingUsers.length > 0) {
      console.log(`  Missing user IDs: ${verification.missingUsers.join(', ')}`)
    }
    
    if (verification.missingUsers.length === 0) {
      console.log('✅ Migration completed successfully!')
    } else {
      console.log('⚠️  Some users were not migrated. Please check the logs.')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}
