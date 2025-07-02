import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export interface MFASettings {
  mfaEnabled: boolean;
  mfaMethod?: 'totp' | 'sms' | 'email';
  backupCodes?: string[];
  lastUpdated: any;
}

/**
 * Toggle MFA setting for a user
 * @param uid - User ID
 * @param enabled - Whether to enable or disable MFA
 * @param method - MFA method (optional)
 * @returns Promise<void>
 */
export async function toggleMFA(
  uid: string, 
  enabled: boolean, 
  method: 'totp' | 'sms' | 'email' = 'totp'
): Promise<void> {
  try {
    if (!uid) {
      throw new Error('User ID is required');
    }

    const userRef = doc(db, 'users', uid);
    
    // Check if user exists
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    const updateData: Partial<MFASettings> = {
      mfaEnabled: enabled,
      lastUpdated: new Date()
    };

    // If enabling MFA, set the method
    if (enabled) {
      updateData.mfaMethod = method;
      
      // Generate backup codes (placeholder - in real implementation, these would be crypto-secure)
      if (!userSnap.data().backupCodes) {
        updateData.backupCodes = generateBackupCodes();
      }
    } else {
      // If disabling MFA, clear the method but keep backup codes for potential re-enabling
      updateData.mfaMethod = undefined;
    }

    await updateDoc(userRef, updateData);
    console.log(`MFA ${enabled ? 'enabled' : 'disabled'} for user:`, uid);
  } catch (error) {
    console.error('Error toggling MFA:', error);
    throw error;
  }
}

/**
 * Get user's current MFA settings
 * @param uid - User ID
 * @returns Promise<MFASettings | null>
 */
export async function getUserMFASettings(uid: string): Promise<MFASettings | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data();
    return {
      mfaEnabled: userData.mfaEnabled || false,
      mfaMethod: userData.mfaMethod,
      backupCodes: userData.backupCodes,
      lastUpdated: userData.lastUpdated
    };
  } catch (error) {
    console.error('Error getting MFA settings:', error);
    return null;
  }
}

/**
 * Generate backup codes for MFA
 * @returns string[] - Array of backup codes
 */
function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    // Generate 8-digit backup codes (in production, use crypto.randomBytes)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}
