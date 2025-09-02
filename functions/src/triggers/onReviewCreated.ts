import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { calculateCredibilityScore, extractCredibilityFactors } from '../shared/credibility/calculateCredibilityScore';
import { BadgeDefinition, UserProfile } from '../shared/credibility/types';
import { CORE_BADGE_DEFINITIONS } from '../shared/credibility/badges';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Triggered when a new review document is created
 * Updates provider's positive review count and credibility score
 */
export const onReviewCreated = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const reviewData = snap.data();
    const reviewId = context.params.reviewId;

    try {
      console.log(`Processing new review: ${reviewId}`);

      // Praise-only reviews: require visibility + approval + completed booking
      if (!reviewData.visible || reviewData.status !== 'approved') {
        console.log(`Review ${reviewId} not visible/approved - skipping`);
        return null;
      }

      // Validate required fields
      if (!reviewData.targetId || !reviewData.bookingId) {
        console.log(`Review ${reviewId} missing required fields - skipping`);
        return null;
      }

      // Verify the booking exists and is completed
      const bookingDoc = await db.collection('bookings').doc(reviewData.bookingId).get();
      if (!bookingDoc.exists || bookingDoc.data()?.status !== 'completed') {
        console.log(`Review ${reviewId} for non-completed booking - skipping`);
        return null;
      }

      const providerId = reviewData.targetId;
      
      // Update provider stats
      await updateProviderReviewStats(providerId);

      console.log(`Successfully processed review creation for ${reviewId}`);
      return null;

    } catch (error) {
      console.error(`Error processing review creation ${reviewId}:`, error);
      throw error;
    }
  });

/**
 * Update provider's review statistics and credibility
 */
async function updateProviderReviewStats(providerId: string) {
  const userRef = db.collection('users').doc(providerId);
  
  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      console.warn(`Provider ${providerId} not found`);
      return;
    }

    const userData = userDoc.data() as UserProfile;
    
    // Initialize stats if they don't exist
    const stats = userData.stats || {};

    // Increment positive review count
    stats.positiveReviewCount = (stats.positiveReviewCount || 0) + 1;

    // Prepare update data
    const updateData: any = {
      stats
    };

    // Recompute credibility score
    const badges = await getActiveBadgesForUser(providerId);
    const credibilityScore = calculateCredibilityScore(
      extractCredibilityFactors(
        { ...userData, stats } as UserProfile,
        badges,
        userData.createdAt?.toDate()
      )
    );

    updateData.credibilityScore = credibilityScore;

    // Apply the update
    transaction.update(userRef, updateData);

    console.log(`Updated provider ${providerId}: +1 positive review, new credibility: ${credibilityScore}`);
  });

  // Check for badge eligibility after review update
  await checkReviewBadgeEligibility(providerId);
}

/**
 * Get active badges for a user
 */
async function getActiveBadgesForUser(userId: string): Promise<BadgeDefinition[]> {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() as UserProfile;
    
    if (!userData.badgeIds || userData.badgeIds.length === 0) {
      return [];
    }

    // For now, return core badges that match user's badge IDs
    return CORE_BADGE_DEFINITIONS.filter((badge: BadgeDefinition) => 
      userData?.badgeIds?.includes(badge.id)
    );
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

/**
 * Check if user is eligible for review-based badges
 */
async function checkReviewBadgeEligibility(userId: string) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;

    const userData = userDoc.data() as UserProfile;
    const currentBadgeIds = userData.badgeIds || [];
    const stats = userData.stats || {};
    const newBadgeIds: string[] = [];

    // Check for 5-star streak badge
    if (!currentBadgeIds.includes('five-star-streak')) {
      const recentReviews = await getRecentReviews(userId, 90); // Last 90 days
      
      if (hasConsecutiveFiveStarReviews(recentReviews, 5)) {
        newBadgeIds.push('five-star-streak');
      }
    }

    // Check for client favorite badge (based on repeat clients)
    if (!currentBadgeIds.includes('client-favorite') && stats.completedBookings >= 15) {
      const repeatClientRate = await calculateRepeatClientRate(userId);
      if (repeatClientRate >= 0.3) { // 30% repeat client rate
        newBadgeIds.push('client-favorite');
      }
    }

    // Award new badges
    if (newBadgeIds.length > 0) {
      await db.collection('users').doc(userId).update({
        badgeIds: admin.firestore.FieldValue.arrayUnion(...newBadgeIds)
      });

      console.log(`Awarded review-based badges to user ${userId}:`, newBadgeIds);

      // Recompute credibility score with new badges
      const allBadgeIds = [...currentBadgeIds, ...newBadgeIds];
      const badges = CORE_BADGE_DEFINITIONS.filter((badge: BadgeDefinition) => allBadgeIds.includes(badge.id));
      
      const credibilityScore = calculateCredibilityScore(
        extractCredibilityFactors(userData, badges, userData.createdAt?.toDate())
      );

      await db.collection('users').doc(userId).update({
        credibilityScore
      });
    }

  } catch (error) {
    console.error('Error checking review badge eligibility:', error);
  }
}

/**
 * Get recent reviews for a provider
 */
async function getRecentReviews(providerId: string, days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const reviewsQuery = db.collection('reviews')
    .where('targetId', '==', providerId)
    .where('visible', '==', true)
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(cutoffDate))
    .orderBy('createdAt', 'desc');

  const snapshot = await reviewsQuery.get();
  return snapshot.docs.map(doc => doc.data());
}

/**
 * Check if user has consecutive 5-star reviews
 */
function hasConsecutiveFiveStarReviews(reviews: any[], requiredCount: number): boolean {
  if (reviews.length < requiredCount) return false;

  // Check the most recent reviews
  const recentReviews = reviews.slice(0, requiredCount);
  return recentReviews.every(review => review.rating === 5);
}

/**
 * Calculate repeat client rate for badge eligibility
 */
async function calculateRepeatClientRate(providerId: string): Promise<number> {
  try {
    const bookingsQuery = db.collection('bookings')
      .where('providerId', '==', providerId)
      .where('status', '==', 'completed');

    const snapshot = await bookingsQuery.get();
    const bookings = snapshot.docs.map(doc => doc.data());

    if (bookings.length === 0) return 0;

    // Count client frequencies
    const clientCounts = new Map<string, number>();
    bookings.forEach(booking => {
      if (booking.clientId) {
        clientCounts.set(booking.clientId, (clientCounts.get(booking.clientId) || 0) + 1);
      }
    });

    // Count repeat clients (clients with 2+ bookings)
    const repeatClients = Array.from(clientCounts.values()).filter(count => count >= 2).length;
    const totalClients = clientCounts.size;

    return totalClients > 0 ? repeatClients / totalClients : 0;
  } catch (error) {
    console.error('Error calculating repeat client rate:', error);
    return 0;
  }
}