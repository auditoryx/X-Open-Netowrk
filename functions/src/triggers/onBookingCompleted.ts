import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { calculateCredibilityScore, extractCredibilityFactors } from '../../../src/lib/credibility';
import { CORE_BADGE_DEFINITIONS } from '../../../src/lib/badges/coreBadges';
import { BadgeDefinition } from '../../../src/types/badge';
import { UserProfile } from '../../../src/types/user';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Triggered when a booking document is updated
 * Handles completion events to update user stats and credibility
 */
export const onBookingCompleted = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const bookingId = context.params.bookingId;

    // Only trigger on status change to completed
    if (before.status !== 'completed' && after.status === 'completed') {
      console.log(`Processing booking completion: ${bookingId}`);
      
      try {
        // Check if booking is paid (required for credit)
        if (!after.isPaid) {
          console.log(`Booking ${bookingId} completed but not paid - skipping credit award`);
          return null;
        }

        // Prevent duplicate processing
        if (after.creditAwarded) {
          console.log(`Credit already awarded for booking ${bookingId}`);
          return null;
        }

        const providerId = after.providerId;
        const clientId = after.clientId;
        
        // Determine credit source
        let creditSource = 'client-confirmed'; // default
        if (after.isByoBooking || after.byoInviteId) {
          creditSource = 'ax-verified'; // BYO bookings count as AX-Verified
        }
        // Note: AX-internal bookings would also be 'ax-verified'

        // Update booking with completion metadata
        const bookingUpdateData = {
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          creditSource,
          creditAwarded: true
        };

        // Update provider stats and credits
        await updateProviderStats(providerId, clientId, creditSource, bookingId);
        
        // Mark booking as processed
        await db.collection('bookings').doc(bookingId).update(bookingUpdateData);

        // Enqueue review prompt (placeholder for future implementation)
        await enqueueReviewPrompt(bookingId, clientId, providerId);

        console.log(`Successfully processed booking completion for ${bookingId}`);
        return null;

      } catch (error) {
        console.error(`Error processing booking completion ${bookingId}:`, error);
        throw error;
      }
    }

    return null;
  });

/**
 * Update provider statistics and credit counts
 */
async function updateProviderStats(providerId: string, clientId: string, creditSource: string, bookingId: string) {
  const userRef = db.collection('users').doc(providerId);
  
  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      console.warn(`Provider ${providerId} not found`);
      return;
    }

    const userData = userDoc.data() as UserProfile;
    
    // Initialize stats and counts if they don't exist
    const stats = userData.stats || {};
    const counts = userData.counts || {};

    // Increment booking count
    stats.completedBookings = (stats.completedBookings || 0) + 1;
    
    // Update last completed timestamp
    stats.lastCompletedAt = admin.firestore.FieldValue.serverTimestamp();

    // Increment appropriate credit count
    if (creditSource === 'ax-verified') {
      counts.axVerifiedCredits = (counts.axVerifiedCredits || 0) + 1;
    } else if (creditSource === 'client-confirmed') {
      counts.clientConfirmedCredits = (counts.clientConfirmedCredits || 0) + 1;
    }

    // Update distinct clients count (90 day window)
    await updateDistinctClientsCount(transaction, userRef, clientId, stats);

    // Prepare update data
    const updateData: any = {
      stats,
      counts
    };

    // Recompute credibility score
    const badges = await getActiveBadgesForUser(providerId);
    const credibilityScore = calculateCredibilityScore(
      extractCredibilityFactors(
        { ...userData, stats, counts } as UserProfile,
        badges,
        userData.createdAt?.toDate()
      )
    );

    updateData.credibilityScore = credibilityScore;

    // Apply the update
    transaction.update(userRef, updateData);

    console.log(`Updated provider ${providerId}: +1 booking, source: ${creditSource}, new credibility: ${credibilityScore}`);
  });

  // Check for badge eligibility after stats update
  await checkBadgeEligibility(providerId);
}

/**
 * Update distinct clients count within 90-day window
 */
async function updateDistinctClientsCount(
  transaction: admin.firestore.Transaction,
  userRef: admin.firestore.DocumentReference,
  newClientId: string,
  stats: any
) {
  // Get recent bookings to count distinct clients
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recentBookingsQuery = db.collection('bookings')
    .where('providerId', '==', userRef.id)
    .where('status', '==', 'completed')
    .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(ninetyDaysAgo));

  const recentBookings = await recentBookingsQuery.get();
  
  const distinctClients = new Set<string>();
  recentBookings.forEach(doc => {
    const booking = doc.data();
    if (booking.clientId) {
      distinctClients.add(booking.clientId);
    }
  });

  // Add the new client
  distinctClients.add(newClientId);

  stats.distinctClients90d = distinctClients.size;
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
    return CORE_BADGE_DEFINITIONS.filter(badge => 
      userData.badgeIds?.includes(badge.id)
    );
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

/**
 * Check if user is eligible for any new badges
 */
async function checkBadgeEligibility(userId: string) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;

    const userData = userDoc.data() as UserProfile;
    const currentBadgeIds = userData.badgeIds || [];
    const stats = userData.stats || {};
    const newBadgeIds: string[] = [];

    // Check milestone badges
    const completedBookings = stats.completedBookings || 0;
    
    if (completedBookings >= 1 && !currentBadgeIds.includes('first-booking')) {
      newBadgeIds.push('first-booking');
    }
    if (completedBookings >= 10 && !currentBadgeIds.includes('milestone-10-bookings')) {
      newBadgeIds.push('milestone-10-bookings');
    }
    if (completedBookings >= 50 && !currentBadgeIds.includes('milestone-50-bookings')) {
      newBadgeIds.push('milestone-50-bookings');
    }
    if (completedBookings >= 100 && !currentBadgeIds.includes('milestone-100-bookings')) {
      newBadgeIds.push('milestone-100-bookings');
    }

    // Check performance badges
    const responseRate = stats.responseRate || 0;
    const avgResponseTime = stats.avgResponseTimeHours || 999;

    if (responseRate >= 80 && avgResponseTime <= 2 && !currentBadgeIds.includes('fast-responder')) {
      newBadgeIds.push('fast-responder');
    }

    // Award new badges
    if (newBadgeIds.length > 0) {
      await db.collection('users').doc(userId).update({
        badgeIds: admin.firestore.FieldValue.arrayUnion(...newBadgeIds)
      });

      console.log(`Awarded badges to user ${userId}:`, newBadgeIds);

      // Recompute credibility score with new badges
      const allBadgeIds = [...currentBadgeIds, ...newBadgeIds];
      const badges = CORE_BADGE_DEFINITIONS.filter(badge => allBadgeIds.includes(badge.id));
      
      const credibilityScore = calculateCredibilityScore(
        extractCredibilityFactors(userData, badges, userData.createdAt?.toDate())
      );

      await db.collection('users').doc(userId).update({
        credibilityScore
      });
    }

  } catch (error) {
    console.error('Error checking badge eligibility:', error);
  }
}

/**
 * Enqueue review prompt for client (placeholder)
 */
async function enqueueReviewPrompt(bookingId: string, clientId: string, providerId: string) {
  // TODO: Implement review prompt system
  // This could add to a queue or send immediate notification
  console.log(`Review prompt queued for booking ${bookingId}, client ${clientId} → provider ${providerId}`);
}