import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserTierUpdate {
  signature?: boolean;
  proTier?: string;
  tier?: string;
  verificationStatus?: string;
}

/**
 * Updates user tier and signature status in Firestore
 * @param uid - User ID
 * @param updates - Object containing tier updates
 * @returns Promise<void>
 */
export async function updateUserTier(uid: string, updates: UserTierUpdate): Promise<void> {
  if (!uid) {
    throw new Error('User ID is required');
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('No updates provided');
  }

  try {
    const userRef = doc(db, 'users', uid);
    
    // Create update object with timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    await updateDoc(userRef, updateData);
    
    console.log(`User ${uid} tier updated successfully:`, updates);
  } catch (error) {
    console.error('Error updating user tier:', error);
    throw new Error(`Failed to update user tier: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Toggle signature status for a user
 * @param uid - User ID
 * @param signature - Whether user should have signature status
 * @returns Promise<void>
 */
export async function toggleSignatureTier(uid: string, signature: boolean): Promise<void> {
  return updateUserTier(uid, { signature });
}

export default updateUserTier;
