import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { calculateTier, TIER_REQUIREMENTS } from '@/constants/gamification';

export interface UserTierData {
  tier: string;
  xp: number;
  nextTier?: string;
  xpToNextTier?: number;
  tierProgress?: number; // Percentage progress to next tier (0-100)
}

/**
 * Get user's current tier and progress information
 * @param userId - The user ID to get tier for
 * @returns Promise<UserTierData | null>
 */
export async function getUserTier(userId: string): Promise<UserTierData | null> {
  try {
    // Get user's XP from their profile or XP document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log(`User not found: ${userId}`);
      return null;
    }
    
    const userData = userDoc.data();
    const userXp = userData.xp || 0;
    
    // Calculate current tier
    const currentTier = calculateTier(userXp);
    
    // Find next tier and calculate progress
    const tierNames = Object.keys(TIER_REQUIREMENTS);
    const currentTierIndex = tierNames.indexOf(currentTier);
    
    let nextTier: string | undefined;
    let xpToNextTier: number | undefined;
    let tierProgress: number | undefined;
    
    if (currentTierIndex < tierNames.length - 1) {
      nextTier = tierNames[currentTierIndex + 1];
      const nextTierRequirement = TIER_REQUIREMENTS[nextTier];
      const currentTierRequirement = TIER_REQUIREMENTS[currentTier];
      
      xpToNextTier = nextTierRequirement - userXp;
      
      // Calculate progress as percentage within current tier range
      const tierRange = nextTierRequirement - currentTierRequirement;
      const progressInRange = userXp - currentTierRequirement;
      tierProgress = Math.min(100, Math.max(0, (progressInRange / tierRange) * 100));
    } else {
      // User is at max tier
      tierProgress = 100;
    }
    
    return {
      tier: currentTier,
      xp: userXp,
      nextTier,
      xpToNextTier,
      tierProgress
    };
  } catch (error) {
    console.error('Error fetching user tier:', error);
    return null;
  }
}

/**
 * Get multiple users' tier data efficiently
 * @param userIds - Array of user IDs
 * @returns Promise<Map<string, UserTierData>>
 */
export async function getMultipleUserTiers(userIds: string[]): Promise<Map<string, UserTierData>> {
  const tierMap = new Map<string, UserTierData>();
  
  try {
    // Fetch all users in parallel
    const userPromises = userIds.map(async (userId) => {
      const tierData = await getUserTier(userId);
      if (tierData) {
        tierMap.set(userId, tierData);
      }
    });
    
    await Promise.all(userPromises);
  } catch (error) {
    console.error('Error fetching multiple user tiers:', error);
  }
  
  return tierMap;
}
