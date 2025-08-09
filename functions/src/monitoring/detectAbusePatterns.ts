import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UserProfile } from '../../../src/types/user';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/** Abuse detection thresholds */
const ABUSE_THRESHOLDS = {
  maxSameClientBookings: 5, // Max bookings from same client per 30 days
  maxRefundRate: 0.3, // Max 30% refund rate
  minTimeBetweenBookings: 1000 * 60 * 60 * 2, // Min 2 hours between bookings
  maxBookingsPerDay: 10, // Max bookings per day
  suspiciousReviewPattern: 5, // 5+ perfect reviews in a row from new clients
} as const;

/**
 * Detect abuse patterns in user activity
 * Can be called manually or triggered by other functions
 */
export const detectAbusePatterns = functions.https.onCall(async (data, context) => {
  const { userId, triggerType = 'manual' } = data;

  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'userId is required');
  }

  try {
    console.log(`Running abuse detection for user ${userId} (trigger: ${triggerType})`);

    const abuseFlags = await analyzeUserForAbuse(userId);
    
    if (abuseFlags.length > 0) {
      await flagUserForReview(userId, abuseFlags, triggerType);
      
      // If severe abuse detected, freeze account immediately
      if (abuseFlags.some(flag => flag.severity === 'high')) {
        await freezeUserAccount(userId, 'Automated abuse detection - high severity flags');
      }
    }

    return {
      success: true,
      flags: abuseFlags,
      actionsRequired: abuseFlags.length > 0
    };

  } catch (error) {
    console.error('Error in abuse detection:', error);
    throw new functions.https.HttpsError('internal', 'Failed to detect abuse patterns');
  }
});

/**
 * Analyze user for various abuse patterns
 */
async function analyzeUserForAbuse(userId: string): Promise<AbuseFlag[]> {
  const flags: AbuseFlag[] = [];

  try {
    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return flags;
    }

    const userData = userDoc.data() as UserProfile;

    // Check same client booking pattern
    const sameClientFlags = await checkSameClientAbuse(userId);
    flags.push(...sameClientFlags);

    // Check refund farming
    const refundFlags = await checkRefundFarming(userId);
    flags.push(...refundFlags);

    // Check booking velocity abuse
    const velocityFlags = await checkBookingVelocityAbuse(userId);
    flags.push(...velocityFlags);

    // Check suspicious review patterns
    const reviewFlags = await checkSuspiciousReviewPattern(userId);
    flags.push(...reviewFlags);

    // Check fake account patterns
    const fakeAccountFlags = await checkFakeAccountPattern(userId, userData);
    flags.push(...fakeAccountFlags);

    console.log(`Abuse analysis for ${userId}: ${flags.length} flags detected`);
    return flags;

  } catch (error) {
    console.error('Error analyzing user for abuse:', error);
    return [];
  }
}

/**
 * Check for same client booking abuse
 */
async function checkSameClientAbuse(userId: string): Promise<AbuseFlag[]> {
  const flags: AbuseFlag[] = [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const recentBookingsQuery = db.collection('bookings')
      .where('providerId', '==', userId)
      .where('status', 'in', ['completed', 'confirmed'])
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo));

    const snapshot = await recentBookingsQuery.get();
    const clientCounts = new Map<string, number>();

    snapshot.docs.forEach(doc => {
      const booking = doc.data();
      if (booking.clientId) {
        clientCounts.set(booking.clientId, (clientCounts.get(booking.clientId) || 0) + 1);
      }
    });

    // Check for excessive same-client bookings
    for (const [clientId, count] of clientCounts.entries()) {
      if (count > ABUSE_THRESHOLDS.maxSameClientBookings) {
        flags.push({
          type: 'same_client_abuse',
          severity: count > ABUSE_THRESHOLDS.maxSameClientBookings * 2 ? 'high' : 'medium',
          description: `${count} bookings from same client (${clientId}) in 30 days`,
          metadata: { clientId, count, threshold: ABUSE_THRESHOLDS.maxSameClientBookings }
        });
      }
    }

  } catch (error) {
    console.error('Error checking same client abuse:', error);
  }

  return flags;
}

/**
 * Check for refund farming patterns
 */
async function checkRefundFarming(userId: string): Promise<AbuseFlag[]> {
  const flags: AbuseFlag[] = [];

  try {
    // Check refund rate over last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const bookingsQuery = db.collection('bookings')
      .where('providerId', '==', userId)
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(ninetyDaysAgo));

    const snapshot = await bookingsQuery.get();
    let totalBookings = 0;
    let refundedBookings = 0;

    snapshot.docs.forEach(doc => {
      const booking = doc.data();
      totalBookings++;
      if (booking.status === 'cancelled' && booking.refunded) {
        refundedBookings++;
      }
    });

    if (totalBookings >= 10) { // Only flag if sufficient sample size
      const refundRate = refundedBookings / totalBookings;
      
      if (refundRate > ABUSE_THRESHOLDS.maxRefundRate) {
        flags.push({
          type: 'refund_farming',
          severity: refundRate > 0.5 ? 'high' : 'medium',
          description: `High refund rate: ${(refundRate * 100).toFixed(1)}% (${refundedBookings}/${totalBookings})`,
          metadata: { refundRate, refundedBookings, totalBookings }
        });
      }
    }

  } catch (error) {
    console.error('Error checking refund farming:', error);
  }

  return flags;
}

/**
 * Check booking velocity abuse
 */
async function checkBookingVelocityAbuse(userId: string): Promise<AbuseFlag[]> {
  const flags: AbuseFlag[] = [];

  try {
    // Check bookings in last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentBookingsQuery = db.collection('bookings')
      .where('providerId', '==', userId)
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(oneDayAgo))
      .orderBy('createdAt', 'desc');

    const snapshot = await recentBookingsQuery.get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Check daily booking limit
    if (bookings.length > ABUSE_THRESHOLDS.maxBookingsPerDay) {
      flags.push({
        type: 'velocity_abuse',
        severity: 'medium',
        description: `${bookings.length} bookings in 24 hours (limit: ${ABUSE_THRESHOLDS.maxBookingsPerDay})`,
        metadata: { bookingsIn24h: bookings.length, limit: ABUSE_THRESHOLDS.maxBookingsPerDay }
      });
    }

    // Check minimum time between bookings
    for (let i = 0; i < bookings.length - 1; i++) {
      const booking1 = bookings[i];
      const booking2 = bookings[i + 1];
      
      const timeDiff = booking1.createdAt?.toMillis() - booking2.createdAt?.toMillis();
      
      if (timeDiff < ABUSE_THRESHOLDS.minTimeBetweenBookings) {
        flags.push({
          type: 'velocity_abuse',
          severity: 'low',
          description: `Bookings created ${Math.round(timeDiff / 1000 / 60)} minutes apart`,
          metadata: { timeDiff, minRequired: ABUSE_THRESHOLDS.minTimeBetweenBookings }
        });
        break; // Only flag once per check
      }
    }

  } catch (error) {
    console.error('Error checking booking velocity:', error);
  }

  return flags;
}

/**
 * Check suspicious review patterns
 */
async function checkSuspiciousReviewPattern(userId: string): Promise<AbuseFlag[]> {
  const flags: AbuseFlag[] = [];

  try {
    // Get recent reviews
    const recentReviewsQuery = db.collection('reviews')
      .where('targetId', '==', userId)
      .where('visible', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(10);

    const snapshot = await recentReviewsQuery.get();
    const reviews = snapshot.docs.map(doc => doc.data());

    // Check for consecutive perfect reviews from new clients
    let consecutivePerfect = 0;
    let newClientPerfect = 0;

    for (const review of reviews) {
      if (review.rating === 5) {
        consecutivePerfect++;
        
        // Check if reviewer is new (created account recently)
        const reviewerDoc = await db.collection('users').doc(review.authorId).get();
        if (reviewerDoc.exists) {
          const reviewerData = reviewerDoc.data();
          const accountAge = Date.now() - reviewerData.createdAt?.toMillis();
          const isNewAccount = accountAge < (1000 * 60 * 60 * 24 * 7); // 7 days
          
          if (isNewAccount) {
            newClientPerfect++;
          }
        }
      } else {
        break; // Reset streak on non-perfect review
      }
    }

    if (consecutivePerfect >= ABUSE_THRESHOLDS.suspiciousReviewPattern && 
        newClientPerfect >= Math.floor(consecutivePerfect * 0.7)) {
      flags.push({
        type: 'suspicious_reviews',
        severity: 'medium',
        description: `${consecutivePerfect} consecutive 5-star reviews, ${newClientPerfect} from new accounts`,
        metadata: { consecutivePerfect, newClientPerfect }
      });
    }

  } catch (error) {
    console.error('Error checking review patterns:', error);
  }

  return flags;
}

/**
 * Check for fake account patterns
 */
async function checkFakeAccountPattern(userId: string, userData: UserProfile): Promise<AbuseFlag[]> {
  const flags: AbuseFlag[] = [];

  try {
    // Check profile completeness vs. booking activity
    const hasMinimalProfile = !userData.bio || !userData.media || userData.media.length === 0;
    const stats = userData.stats || {};
    const hasHighActivity = (stats.completedBookings || 0) > 10;

    if (hasMinimalProfile && hasHighActivity) {
      flags.push({
        type: 'fake_account_pattern',
        severity: 'low',
        description: 'High booking activity with minimal profile information',
        metadata: { completedBookings: stats.completedBookings }
      });
    }

    // Check account age vs. activity level
    const accountAgeMs = Date.now() - (userData.createdAt?.toMillis() || Date.now());
    const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24);
    
    if (accountAgeDays < 30 && hasHighActivity) {
      flags.push({
        type: 'fake_account_pattern',
        severity: 'low',
        description: `Very new account (${Math.round(accountAgeDays)} days) with high activity`,
        metadata: { accountAgeDays, completedBookings: stats.completedBookings }
      });
    }

  } catch (error) {
    console.error('Error checking fake account patterns:', error);
  }

  return flags;
}

/**
 * Flag user for manual review
 */
async function flagUserForReview(userId: string, flags: AbuseFlag[], triggerType: string) {
  const flagDoc = {
    userId,
    flags,
    triggerType,
    status: 'pending_review',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
    resolution: null
  };

  await db.collection('abuseFlags').add(flagDoc);
  console.log(`User ${userId} flagged for review with ${flags.length} flags`);
}

/**
 * Freeze user account for severe abuse
 */
async function freezeUserAccount(userId: string, reason: string) {
  await db.collection('users').doc(userId).update({
    tierFrozen: true,
    freezeReason: reason,
    frozenAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`User ${userId} account frozen: ${reason}`);
}

/** Abuse flag interface */
interface AbuseFlag {
  type: 'same_client_abuse' | 'refund_farming' | 'velocity_abuse' | 'suspicious_reviews' | 'fake_account_pattern';
  severity: 'low' | 'medium' | 'high';
  description: string;
  metadata?: Record<string, any>;
}