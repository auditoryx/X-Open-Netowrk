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
 * Recompute credibility score for a user or all users
 * Can be called manually or as part of maintenance
 */
export const recomputeCredibilityScore = functions.https.onCall(async (data, context) => {
  const { userId, batchMode = false } = data;

  // Require authentication for this sensitive operation
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  try {
    if (userId) {
      // Recompute for specific user
      const result = await recomputeUserCredibility(userId);
      return {
        success: true,
        userId,
        credibilityScore: result.credibilityScore,
        message: 'Credibility score updated'
      };
    } else if (batchMode) {
      // Recompute for all creators (admin only)
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.data();
      
      if (userData?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required for batch mode');
      }
      
      const result = await recomputeAllCredibilityScores();
      return {
        success: true,
        processed: result.processed,
        errors: result.errors,
        message: `Processed ${result.processed} users`
      };
    } else {
      throw new functions.https.HttpsError('invalid-argument', 'Either userId or batchMode=true required');
    }

  } catch (error) {
    console.error('Error in recompute credibility score:', error);
    throw new functions.https.HttpsError('internal', 'Failed to recompute credibility score');
  }
});

/**
 * Recompute credibility score for a single user
 */
async function recomputeUserCredibility(userId: string): Promise<{ credibilityScore: number }> {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }

  const userData = userDoc.data() as UserProfile;
  
  // Get active badges
  const badges = await getActiveBadgesForUser(userId, userData);
  
  // Calculate new credibility score
  const credibilityScore = calculateCredibilityScore(
    extractCredibilityFactors(userData, badges, userData.createdAt?.toDate())
  );

  // Update the user document
  await userRef.update({ credibilityScore });

  console.log(`Updated credibility score for user ${userId}: ${credibilityScore}`);
  return { credibilityScore };
}

/**
 * Recompute credibility scores for all creators
 */
async function recomputeAllCredibilityScores(): Promise<{ processed: number; errors: number }> {
  console.log('Starting batch credibility score recomputation');
  
  const batchSize = 500;
  let processed = 0;
  let errors = 0;
  let lastDoc: admin.firestore.QueryDocumentSnapshot | null = null;

  while (true) {
    let query: admin.firestore.Query = db.collection('users')
      .where('roles', 'array-contains', 'creator')
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
      try {
        const userData = userDoc.data() as UserProfile;
        
        // Get active badges
        const badges = await getActiveBadgesForUser(userDoc.id, userData);
        
        // Calculate new credibility score
        const credibilityScore = calculateCredibilityScore(
          extractCredibilityFactors(userData, badges, userData.createdAt?.toDate())
        );

        // Add to batch update
        batch.update(userDoc.ref, { credibilityScore });
        
        processed++;
      } catch (error) {
        console.error(`Error processing user ${userDoc.id}:`, error);
        errors++;
      }
    }

    // Commit batch
    await batch.commit();
    
    lastDoc = snapshot.docs[snapshot.docs.length - 1];
    console.log(`Processed ${processed} users so far...`);
  }

  console.log(`Batch credibility recomputation complete: ${processed} processed, ${errors} errors`);
  return { processed, errors };
}

/**
 * Get active badges for a user
 */
async function getActiveBadgesForUser(userId: string, userData?: UserProfile): Promise<BadgeDefinition[]> {
  try {
    if (!userData) {
      const userDoc = await db.collection('users').doc(userId).get();
      userData = userDoc.data() as UserProfile;
    }
    
    if (!userData?.badgeIds || userData.badgeIds.length === 0) {
      return [];
    }

    // For now, return core badges that match user's badge IDs
    // In the future, this could fetch from badgeDefinitions collection
    return CORE_BADGE_DEFINITIONS.filter(badge => 
      userData?.badgeIds?.includes(badge.id)
    );
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

/**
 * Scheduled function to recompute credibility scores weekly
 * Runs every Sunday at 03:00 UTC
 */
export const weeklyCredibilityRecompute = functions.pubsub
  .schedule('0 3 * * 0')
  .timeZone('UTC')
  .onRun(async () => {
    console.log('Starting weekly credibility score recomputation');
    
    try {
      const result = await recomputeAllCredibilityScores();
      console.log(`Weekly credibility recompute complete: ${result.processed} processed, ${result.errors} errors`);
      return null;
    } catch (error) {
      console.error('Error in weekly credibility recompute:', error);
      throw error;
    }
  });