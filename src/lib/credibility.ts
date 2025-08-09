import { UserProfile } from '@/types/user';
import { 
  CredibilityFactors, 
  CredibilityConfig, 
  BadgeDefinition
} from '../../../libs/shared/credibility/types';
import {
  calculateCredibilityScore as calculate,
  extractCredibilityFactors as extract
} from '../../../libs/shared/credibility/calculateCredibilityScore';

// Re-export types and functions for backward compatibility
export type { CredibilityFactors, CredibilityConfig, BadgeDefinition };
export { calculate as calculateCredibilityScore, extract as extractCredibilityFactors };

/**
 * Calculate and update credibility score for a user
 * This is a convenience wrapper that handles async operations
 */
export async function recomputeUserCredibilityScore(
  uid: string,
  profile: UserProfile,
  badges?: BadgeDefinition[],
  config?: CredibilityConfig
): Promise<number> {
  try {
    const accountCreatedAt = profile.createdAt?.toDate?.() || 
                            (profile.createdAt ? new Date(profile.createdAt) : undefined);
    
    const factors = extract(profile, badges, accountCreatedAt);
    const credibilityScore = calculate(factors, config);
    
    // Note: This function calculates the score but doesn't update Firestore
    // The calling code should handle the database update
    return credibilityScore;
  } catch (error) {
    console.error('Error computing credibility score for user:', uid, error);
    return 0;
  }
}