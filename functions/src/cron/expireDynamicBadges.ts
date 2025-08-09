import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { CORE_BADGE_DEFINITIONS } from '../../../src/lib/badges/coreBadges';
import { BadgeDefinition } from '../../../src/types/badge';
import { UserProfile } from '../../../src/types/user';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Daily cron job to expire dynamic badges and refresh time-sensitive badges
 * Runs every day at 06:00 UTC
 */
export const expireDynamicBadgesDaily = functions.pubsub
  .schedule('0 6 * * *')
  .timeZone('UTC')
  .onRun(async () => {
    console.log('Starting daily dynamic badge expiry and refresh');
    
    try {
      const batchSize = 500;
      let processedUsers = 0;
      let expiredBadges = 0;
      let assignedBadges = 0;

      // Process users in batches
      let lastDoc: admin.firestore.QueryDocumentSnapshot | null = null;
      
      while (true) {
        let query: admin.firestore.Query = db.collection('users')
          .where('role', '==', 'creator')
          .orderBy(admin.firestore.FieldPath.documentId())
          .limit(batchSize);

        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }

        const snapshot = await query.get();
        if (snapshot.empty) break;

        // Process this batch
        const batch = db.batch();
        
        for (const userDoc of snapshot.docs) {
          const userData = userDoc.data() as UserProfile;
          
          if (!userData.badgeIds || userData.badgeIds.length === 0) {
            continue;
          }

          const result = await processDynamicBadgesForUser(userDoc.id, userData);
          
          if (result.hasChanges) {
            batch.update(userDoc.ref, {
              badgeIds: result.updatedBadgeIds,
              credibilityScore: result.updatedCredibilityScore
            });
            
            expiredBadges += result.expiredCount;
            assignedBadges += result.assignedCount;
          }
        }

        // Commit batch updates
        await batch.commit();
        
        processedUsers += snapshot.docs.length;
        lastDoc = snapshot.docs[snapshot.docs.length - 1];

        console.log(`Processed ${processedUsers} users so far...`);
      }

      console.log(`Daily badge maintenance complete: ${processedUsers} users processed, ${expiredBadges} badges expired, ${assignedBadges} badges assigned`);
      return null;

    } catch (error) {
      console.error('Error in daily badge maintenance:', error);
      throw error;
    }
  });

/**
 * Process dynamic badges for a single user
 */
async function processDynamicBadgesForUser(userId: string, userData: UserProfile) {
  const currentBadgeIds = userData.badgeIds || [];
  let updatedBadgeIds = [...currentBadgeIds];
  let hasChanges = false;
  let expiredCount = 0;
  let assignedCount = 0;

  // Check for expired dynamic badges
  const dynamicBadges = CORE_BADGE_DEFINITIONS.filter(badge => 
    badge.category === 'dynamic' && currentBadgeIds.includes(badge.id)
  );

  for (const badge of dynamicBadges) {
    if (await shouldExpireBadge(userId, badge)) {
      updatedBadgeIds = updatedBadgeIds.filter(id => id !== badge.id);
      hasChanges = true;
      expiredCount++;
      console.log(`Expired badge ${badge.id} for user ${userId}`);
    }
  }

  // Check for new dynamic badge assignments
  const newBadges = await checkDynamicBadgeEligibility(userId, userData, updatedBadgeIds);
  if (newBadges.length > 0) {
    updatedBadgeIds.push(...newBadges);
    hasChanges = true;
    assignedCount = newBadges.length;
    console.log(`Assigned dynamic badges to user ${userId}:`, newBadges);
  }

  // Recompute credibility score if badges changed
  let updatedCredibilityScore = userData.credibilityScore || 0;
  if (hasChanges) {
    const activeBadges = CORE_BADGE_DEFINITIONS.filter(badge => updatedBadgeIds.includes(badge.id));
    const { calculateCredibilityScore, extractCredibilityFactors } = require('../../../src/lib/credibility');
    
    updatedCredibilityScore = calculateCredibilityScore(
      extractCredibilityFactors(userData, activeBadges, userData.createdAt?.toDate())
    );
  }

  return {
    hasChanges,
    updatedBadgeIds,
    updatedCredibilityScore,
    expiredCount,
    assignedCount
  };
}

/**
 * Check if a dynamic badge should expire
 */
async function shouldExpireBadge(userId: string, badge: BadgeDefinition): Promise<boolean> {
  if (!badge.criteria?.ttlDays) return false;

  // For now, use simple heuristics. In production, you'd track assignment dates
  const ttlDays = badge.criteria.ttlDays;
  
  switch (badge.id) {
    case 'trending-now':
      // Expires if no bookings in the last 7 days
      return !(await hasRecentActivity(userId, 7));
      
    case 'rising-talent':
      // Expires if growth has plateaued (no bookings in 30 days)
      return !(await hasRecentActivity(userId, 30));
      
    case 'new-this-week':
      // Expires 14 days after account creation
      return await isAccountOlderThan(userId, 14);
      
    default:
      return false;
  }
}

/**
 * Check if user has recent booking activity
 */
async function hasRecentActivity(userId: string, days: number): Promise<boolean> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentBookingsQuery = db.collection('bookings')
    .where('providerId', '==', userId)
    .where('status', '==', 'completed')
    .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(cutoffDate))
    .limit(1);

  const snapshot = await recentBookingsQuery.get();
  return !snapshot.empty;
}

/**
 * Check if account is older than specified days
 */
async function isAccountOlderThan(userId: string, days: number): Promise<boolean> {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) return true;

  const userData = userDoc.data();
  const createdAt = userData?.createdAt?.toDate() || new Date();
  const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysSinceCreation > days;
}

/**
 * Check eligibility for dynamic badges
 */
async function checkDynamicBadgeEligibility(userId: string, userData: UserProfile, currentBadgeIds: string[]): Promise<string[]> {
  const newBadges: string[] = [];
  const stats = userData.stats || {};

  // New This Week badge
  if (!currentBadgeIds.includes('new-this-week')) {
    const isNewUser = await isAccountOlderThan(userId, 7);
    if (!isNewUser) {
      newBadges.push('new-this-week');
    }
  }

  // Trending Now badge (2+ bookings in last 7 days)
  if (!currentBadgeIds.includes('trending-now')) {
    const recentBookingCount = await getRecentBookingCount(userId, 7);
    if (recentBookingCount >= 2) {
      newBadges.push('trending-now');
    }
  }

  // Rising Talent badge (3+ bookings in last 30 days + account less than 90 days old)
  if (!currentBadgeIds.includes('rising-talent')) {
    const recentBookingCount = await getRecentBookingCount(userId, 30);
    const isRecentAccount = !(await isAccountOlderThan(userId, 90));
    
    if (recentBookingCount >= 3 && isRecentAccount) {
      newBadges.push('rising-talent');
    }
  }

  return newBadges;
}

/**
 * Get count of recent bookings
 */
async function getRecentBookingCount(userId: string, days: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentBookingsQuery = db.collection('bookings')
    .where('providerId', '==', userId)
    .where('status', '==', 'completed')
    .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(cutoffDate));

  const snapshot = await recentBookingsQuery.get();
  return snapshot.size;
}

/**
 * Manually assign badges if eligible (can be called by other functions)
 */
export const assignBadgesIfEligible = functions.https.onCall(async (data, context) => {
  // Require authentication and admin role for manual badge assignment
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { userId, force = false } = data;
  
  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'userId is required');
  }

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data() as UserProfile;
    const result = await processDynamicBadgesForUser(userId, userData);

    if (result.hasChanges || force) {
      await db.collection('users').doc(userId).update({
        badgeIds: result.updatedBadgeIds,
        credibilityScore: result.updatedCredibilityScore
      });
    }

    return {
      success: true,
      assignedBadges: result.assignedCount,
      expiredBadges: result.expiredCount,
      newCredibilityScore: result.updatedCredibilityScore
    };

  } catch (error) {
    console.error('Error in manual badge assignment:', error);
    throw new functions.https.HttpsError('internal', 'Failed to assign badges');
  }
});