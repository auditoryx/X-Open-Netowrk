/**
 * Daily cron job to expire dynamic badges
 * Removes badges that have passed their expiration date
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function expireDynamicBadgesDaily() {
  console.log('🔄 Starting dynamic badge expiration process...');
  
  try {
    const now = admin.firestore.Timestamp.now();
    
    // Query for expired badges
    const expiredBadgesQuery = db.collection('userBadges')
      .where('expiresAt', '<=', now);
    
    const expiredBadgesSnapshot = await expiredBadgesQuery.get();
    
    if (expiredBadgesSnapshot.empty) {
      console.log('✅ No expired badges found');
      return { success: true, expired: 0 };
    }
    
    console.log(`📋 Found ${expiredBadgesSnapshot.size} expired badges to remove`);
    
    // Process badges in batches to avoid transaction limits
    const batchSize = 100;
    const batches = [];
    let currentBatch = db.batch();
    let operationCount = 0;
    
    const userBadgeUpdates = new Map(); // Track badge removals per user
    
    expiredBadgesSnapshot.forEach(doc => {
      const badgeData = doc.data();
      const userId = badgeData.userId;
      const badgeId = badgeData.badgeId;
      
      // Track which users need badge ID removal
      if (!userBadgeUpdates.has(userId)) {
        userBadgeUpdates.set(userId, []);
      }
      userBadgeUpdates.get(userId).push(badgeId);
      
      // Delete the expired badge document
      currentBatch.delete(doc.ref);
      operationCount++;
      
      // Create new batch if current one is full
      if (operationCount >= batchSize) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        operationCount = 0;
      }
    });
    
    // Add the last batch if it has operations
    if (operationCount > 0) {
      batches.push(currentBatch);
    }
    
    // Execute badge deletion batches
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`✅ Deleted badge batch ${i + 1}/${batches.length}`);
    }
    
    // Update user badgeIds arrays
    let userUpdateCount = 0;
    for (const [userId, expiredBadgeIds] of userBadgeUpdates) {
      try {
        await db.runTransaction(async (transaction) => {
          const userRef = db.collection('users').doc(userId);
          const userDoc = await transaction.get(userRef);
          
          if (!userDoc.exists) {
            console.warn(`⚠️ User ${userId} not found, skipping badge removal`);
            return;
          }
          
          const userData = userDoc.data();
          const currentBadgeIds = userData.badgeIds || [];
          
          // Remove expired badge IDs
          const updatedBadgeIds = currentBadgeIds.filter(badgeId => 
            !expiredBadgeIds.includes(badgeId)
          );
          
          if (updatedBadgeIds.length !== currentBadgeIds.length) {
            transaction.update(userRef, {
              badgeIds: updatedBadgeIds,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`🏷️ Removed ${expiredBadgeIds.length} expired badges from user ${userId}`);
          }
        });
        
        userUpdateCount++;
        
        // Add small delay to avoid overwhelming Firestore
        if (userUpdateCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`❌ Error updating badges for user ${userId}:`, error);
      }
    }
    
    console.log(`✅ Badge expiration complete:`);
    console.log(`   - Expired badges removed: ${expiredBadgesSnapshot.size}`);
    console.log(`   - Users updated: ${userUpdateCount}`);
    
    return {
      success: true,
      expired: expiredBadgesSnapshot.size,
      usersUpdated: userUpdateCount
    };
    
  } catch (error) {
    console.error('❌ Error in badge expiration process:', error);
    throw error;
  }
}

// Execute if called directly
if (require.main === module) {
  expireDynamicBadgesDaily()
    .then(result => {
      console.log('🎯 Badge expiration completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Badge expiration failed:', error);
      process.exit(1);
    });
}

module.exports = { expireDynamicBadgesDaily };