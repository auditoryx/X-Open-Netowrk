import { UserProfile } from '@/types/user';
import { BadgeDefinition } from '@/types/badge';

/** Credibility score calculation parameters */
export interface CredibilityFactors {
  // User data
  tier: 'standard' | 'verified' | 'signature';
  axVerifiedCredits: number;
  clientConfirmedCredits: number;
  distinctClients90d: number;
  positiveReviewCount: number;
  completedBookings: number;
  responseRate?: number; // 0-100
  avgResponseTimeHours?: number;
  lastCompletedAt?: Date;
  
  // Badge impact
  activeBadges?: BadgeDefinition[];
  
  // Time factors
  accountAge?: number; // days since account creation
  daysSinceLastBooking?: number;
}

/** Tier precedence weights (higher tier = higher base score) */
const TIER_WEIGHTS = {
  signature: 1000,
  verified: 500, 
  standard: 100
} as const;

/** Credit source multipliers (AX-Verified weighted highest) */
const CREDIT_MULTIPLIERS = {
  axVerified: 3.0,
  clientConfirmed: 2.0,
  selfReported: 1.0 // Not used in current calculation but for future
} as const;

/** Diminishing returns curve for credits */
function applyDiminishingReturns(value: number, threshold: number = 50): number {
  if (value <= threshold) {
    return value;
  }
  // Logarithmic scaling after threshold
  return threshold + Math.log(value - threshold + 1) * 10;
}

/** Calculate recency boost based on last activity */
function calculateRecencyBoost(daysSinceLastBooking?: number): number {
  if (!daysSinceLastBooking) return 0;
  
  if (daysSinceLastBooking <= 7) return 50; // Very recent
  if (daysSinceLastBooking <= 30) return 25; // Recent
  if (daysSinceLastBooking <= 90) return 10; // Somewhat recent
  return 0; // Not recent
}

/** Calculate inactivity decay penalty */
function calculateInactivityDecay(daysSinceLastBooking?: number): number {
  if (!daysSinceLastBooking) return 0;
  
  if (daysSinceLastBooking > 180) return -100; // Heavy penalty for 6+ months
  if (daysSinceLastBooking > 90) return -50;   // Moderate penalty for 3+ months
  return 0; // No penalty for recent activity
}

/** Calculate badge score impact */
function calculateBadgeImpact(badges?: BadgeDefinition[]): number {
  if (!badges || badges.length === 0) return 0;
  
  return badges.reduce((total, badge) => {
    return total + (badge.scoreImpact || 0);
  }, 0);
}

/** Calculate response metrics bonus */
function calculateResponseBonus(responseRate?: number, avgResponseTimeHours?: number): number {
  let bonus = 0;
  
  // Response rate bonus (0-100 scale)
  if (responseRate) {
    if (responseRate >= 95) bonus += 30;
    else if (responseRate >= 90) bonus += 20;
    else if (responseRate >= 80) bonus += 10;
  }
  
  // Response time bonus  
  if (avgResponseTimeHours) {
    if (avgResponseTimeHours <= 1) bonus += 25;
    else if (avgResponseTimeHours <= 4) bonus += 15;
    else if (avgResponseTimeHours <= 12) bonus += 5;
  }
  
  return bonus;
}

/**
 * Compute credibility score using tier precedence + AX credits + distinct clients + 
 * verified reviews + badge impact + recency boost + inactivity decay - penalties
 */
export function calculateCredibilityScore(factors: CredibilityFactors): number {
  // 1. Tier precedence (base score)
  const tierScore = TIER_WEIGHTS[factors.tier];
  
  // 2. AX-Verified credits with diminishing returns
  const axCreditsScore = applyDiminishingReturns(
    factors.axVerifiedCredits * CREDIT_MULTIPLIERS.axVerified
  );
  
  // 3. Client-Confirmed credits (lower weight)
  const clientCreditsScore = applyDiminishingReturns(
    factors.clientConfirmedCredits * CREDIT_MULTIPLIERS.clientConfirmed
  );
  
  // 4. Distinct clients (social proof)
  const clientDiversityScore = Math.min(factors.distinctClients90d * 5, 100);
  
  // 5. Positive reviews (social validation)
  const reviewScore = Math.min(factors.positiveReviewCount * 3, 150);
  
  // 6. Badge impact (achievements & performance)
  const badgeScore = calculateBadgeImpact(factors.activeBadges);
  
  // 7. Response metrics bonus
  const responseScore = calculateResponseBonus(
    factors.responseRate, 
    factors.avgResponseTimeHours
  );
  
  // 8. Recency boost (recent activity)
  const recencyBoost = calculateRecencyBoost(factors.daysSinceLastBooking);
  
  // 9. Inactivity decay (penalize long absence)
  const inactivityPenalty = calculateInactivityDecay(factors.daysSinceLastBooking);
  
  // Combine all factors
  const totalScore = 
    tierScore +
    axCreditsScore +
    clientCreditsScore + 
    clientDiversityScore +
    reviewScore +
    badgeScore +
    responseScore +
    recencyBoost +
    inactivityPenalty;
  
  // Ensure minimum score and reasonable bounds
  return Math.max(totalScore, 0);
}

/**
 * Extract credibility factors from user profile and related data
 */
export function extractCredibilityFactors(
  profile: UserProfile,
  badges?: BadgeDefinition[],
  accountCreatedAt?: Date
): CredibilityFactors {
  const now = new Date();
  const lastCompleted = profile.stats?.lastCompletedAt?.toDate?.() || 
                       (profile.stats?.lastCompletedAt ? new Date(profile.stats.lastCompletedAt) : undefined);
  
  return {
    tier: profile.tier,
    axVerifiedCredits: profile.counts?.axVerifiedCredits || 0,
    clientConfirmedCredits: profile.counts?.clientConfirmedCredits || 0,
    distinctClients90d: profile.stats?.distinctClients90d || 0,
    positiveReviewCount: profile.stats?.positiveReviewCount || 0,
    completedBookings: profile.stats?.completedBookings || 0,
    responseRate: profile.stats?.responseRate,
    avgResponseTimeHours: profile.stats?.avgResponseTimeHours,
    lastCompletedAt: lastCompleted,
    activeBadges: badges,
    accountAge: accountCreatedAt ? Math.floor((now.getTime() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24)) : undefined,
    daysSinceLastBooking: lastCompleted ? Math.floor((now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)) : undefined
  };
}

/**
 * Calculate and update credibility score for a user
 */
export async function recomputeUserCredibilityScore(
  uid: string,
  profile: UserProfile,
  badges?: BadgeDefinition[]
): Promise<number> {
  try {
    const accountCreatedAt = profile.createdAt?.toDate?.() || 
                            (profile.createdAt ? new Date(profile.createdAt) : undefined);
    
    const factors = extractCredibilityFactors(profile, badges, accountCreatedAt);
    const credibilityScore = calculateCredibilityScore(factors);
    
    // Note: This function calculates the score but doesn't update Firestore
    // The calling code should handle the database update
    return credibilityScore;
  } catch (error) {
    console.error('Error computing credibility score for user:', uid, error);
    return 0;
  }
}