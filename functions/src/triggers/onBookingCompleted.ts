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

        // Check if booking was refunded or cancelled - no credit/badge/review allowed
        if (after.status === 'refunded' || after.status === 'cancelled' || after.wasRefunded) {
          console.log(`Booking ${bookingId} was refunded/cancelled - no credit/badge awarded`);
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
        await updateProviderStats(providerId, clientId, creditSource, bookingId, after);
        
        // Check for role-specific badge eligibility if booking was from an offer
        if (after.offerId) {
          await checkOfferBasedBadgeEligibility(providerId, after);
        }
        
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
async function updateProviderStats(providerId: string, clientId: string, creditSource: string, bookingId: string, bookingData: any) {
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
    return CORE_BADGE_DEFINITIONS.filter((badge: BadgeDefinition) => 
      userData?.badgeIds?.includes(badge.id)
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
      const badges = CORE_BADGE_DEFINITIONS.filter((badge: BadgeDefinition) => allBadgeIds.includes(badge.id));
      
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
 * Check for role-specific badge eligibility based on offer bookings
 */
async function checkOfferBasedBadgeEligibility(userId: string, bookingData: any) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;

    const userData = userDoc.data() as UserProfile;
    const currentBadgeIds = userData.badgeIds || [];
    const newBadgeIds: string[] = [];
    const now = admin.firestore.Timestamp.now();
    
    // Get offer details if available
    let offerDoc = null;
    if (bookingData.offerId) {
      offerDoc = await db.collection('offers').doc(bookingData.offerId).get();
    }
    
    const offer = offerDoc?.data();
    const role = offer?.role || bookingData.serviceRole;
    
    // Role-specific badge checks
    switch (role) {
      case 'producer':
        // Beat Store Active: Has active beat offers
        if (!currentBadgeIds.includes('beat-store-active')) {
          const activeBeats = await db.collection('offers')
            .where('userId', '==', userId)
            .where('role', '==', 'producer')
            .where('active', '==', true)
            .get();
            
          if (activeBeats.size >= 3) {
            newBadgeIds.push('beat-store-active');
          }
        }
        
        // 50+ Leases: Count non-exclusive bookings
        if (!currentBadgeIds.includes('fifty-plus-leases')) {
          const leaseBookings = await db.collection('bookings')
            .where('providerId', '==', userId)
            .where('status', '==', 'completed')
            .get();
            
          const leaseCount = leaseBookings.docs.filter(doc => {
            const data = doc.data();
            return data.offerSnapshot?.licenseOptions?.includes('Non-Exclusive') || 
                   !data.offerSnapshot?.licenseOptions?.includes('Exclusive');
          }).length;
          
          if (leaseCount >= 50) {
            newBadgeIds.push('fifty-plus-leases');
          }
        }
        
        // Exclusive Sale: Made at least one exclusive sale
        if (!currentBadgeIds.includes('exclusive-sale')) {
          const exclusiveBookings = await db.collection('bookings')
            .where('providerId', '==', userId)
            .where('status', '==', 'completed')
            .get();
            
          const hasExclusive = exclusiveBookings.docs.some(doc => {
            const data = doc.data();
            return data.offerSnapshot?.licenseOptions?.includes('Exclusive');
          });
          
          if (hasExclusive) {
            newBadgeIds.push('exclusive-sale');
          }
        }
        break;
        
      case 'videographer':
        // Delivered Media Attached: Consistently delivers with media attachments
        if (!currentBadgeIds.includes('delivered-media-attached')) {
          const videoBookings = await db.collection('bookings')
            .where('providerId', '==', userId)
            .where('status', '==', 'completed')
            .limit(10)
            .get();
            
          const withMedia = videoBookings.docs.filter(doc => {
            const data = doc.data();
            return data.deliveredMedia && data.deliveredMedia.length > 0;
          }).length;
          
          if (videoBookings.size >= 5 && withMedia / videoBookings.size >= 0.9) {
            newBadgeIds.push('delivered-media-attached');
          }
        }
        break;
        
      case 'engineer':
        // On-Time Streak 10: Check delivery times
        if (!currentBadgeIds.includes('on-time-streak-10')) {
          const recentBookings = await db.collection('bookings')
            .where('providerId', '==', userId)
            .where('status', '==', 'completed')
            .orderBy('completedAt', 'desc')
            .limit(10)
            .get();
            
          const onTimeCount = recentBookings.docs.filter(doc => {
            const data = doc.data();
            const deliveredOnTime = data.deliveredOnTime !== false; // Assume on time unless marked otherwise
            return deliveredOnTime;
          }).length;
          
          if (recentBookings.size >= 10 && onTimeCount === 10) {
            newBadgeIds.push('on-time-streak-10');
          }
        }
        
        // 20 Mix+Master in 60d: Count recent mix/master work
        if (!currentBadgeIds.includes('twenty-mix-master-60d')) {
          const sixtyDaysAgo = new Date();
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
          
          const recentWork = await db.collection('bookings')
            .where('providerId', '==', userId)
            .where('status', '==', 'completed')
            .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(sixtyDaysAgo))
            .get();
            
          const mixMasterCount = recentWork.docs.filter(doc => {
            const data = doc.data();
            return data.offerSnapshot?.service === 'Mix' || 
                   data.offerSnapshot?.service === 'Master' ||
                   data.offerSnapshot?.service === 'Bundle';
          }).length;
          
          if (mixMasterCount >= 20) {
            newBadgeIds.push('twenty-mix-master-60d');
          }
        }
        break;
        
      case 'artist':
        // 5 Verified Features: Count feature collaborations
        if (!currentBadgeIds.includes('five-verified-features')) {
          const featureBookings = await db.collection('bookings')
            .where('providerId', '==', userId)
            .where('status', '==', 'completed')
            .get();
            
          const featureCount = featureBookings.docs.filter(doc => {
            const data = doc.data();
            return data.offerSnapshot?.featureType === 'Vocals' || 
                   data.offerSnapshot?.featureType === 'Rap' ||
                   data.creditSource === 'ax-verified';
          }).length;
          
          if (featureCount >= 5) {
            newBadgeIds.push('five-verified-features');
          }
        }
        break;
        
      case 'studio':
        // High-End Gear Verified: Check if studio has verified equipment
        if (!currentBadgeIds.includes('high-end-gear-verified')) {
          const studioOffers = await db.collection('offers')
            .where('userId', '==', userId)
            .where('role', '==', 'studio')
            .get();
            
          const hasHighEndGear = studioOffers.docs.some(doc => {
            const data = doc.data();
            return data.equipment && data.equipment.some((item: string) => 
              item.includes('SSL') || 
              item.includes('Neve') || 
              item.includes('API') ||
              item.includes('Neumann') ||
              item.includes('Pro Tools HDX')
            );
          });
          
          if (hasHighEndGear) {
            newBadgeIds.push('high-end-gear-verified');
          }
        }
        break;
    }
    
    // Award new badges with expiration for dynamic ones
    if (newBadgeIds.length > 0) {
      await db.collection('users').doc(userId).update({
        badgeIds: admin.firestore.FieldValue.arrayUnion(...newBadgeIds)
      });
      
      // Set expiration for dynamic badges
      const badgeUpdates = newBadgeIds.map(async (badgeId) => {
        const isTimeLimited = ['on-time-streak-10', 'twenty-mix-master-60d'].includes(badgeId);
        if (isTimeLimited) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 90); // 90 day expiration
          
          await db.collection('userBadges').add({
            userId,
            badgeId,
            awardedAt: now,
            expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
            awardedBy: 'system',
            source: 'offer-completion'
          });
        }
      });
      
      await Promise.all(badgeUpdates);
      
      console.log(`Awarded offer-based badges to user ${userId}:`, newBadgeIds);
    }
    
  } catch (error) {
    console.error('Error checking offer-based badge eligibility:', error);
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