import { CredibilityFactors, CredibilityConfig, BadgeDefinition } from './types';

/** Default configuration for credibility scoring */
const DEFAULT_CONFIG: CredibilityConfig = {
  tierWeights: {
    signature: 1000,
    verified: 500,
    standard: 100
  },
  creditMultipliers: {
    axVerified: 3.0,
    clientConfirmed: 2.0,
    selfReported: 1.0
  },
  distinctClientCaps: {
    maxImpact: 100,
    perClientScore: 5,
    windowDays: 90
  },
  recencyWindows: {
    veryRecent: 7,
    recent: 30,
    somewhatRecent: 90,
    inactivityThreshold: 90,
    heavyPenaltyThreshold: 180
  },
  recencyBoosts: {
    veryRecent: 50,
    recent: 25,
    somewhatRecent: 10
  },
  inactivityPenalties: {
    moderate: -50,
    heavy: -100
  },
  diminishingReturns: {
    threshold: 50,
    logScaling: 10
  },
  responseMetrics: {
    excellentResponseRate: 95,
    goodResponseRate: 90,
    decentResponseRate: 80,
    fastResponseTime: 1,
    goodResponseTime: 4,
    okResponseTime: 12,
    bonuses: {
      excellentResponse: 30,
      goodResponse: 20,
      decentResponse: 10,
      fastTime: 25,
      goodTime: 15,
      okTime: 5
    }
  }
};

/** Diminishing returns curve for credits */
function applyDiminishingReturns(value: number, threshold: number, logScaling: number): number {
  if (value <= threshold) {
    return value;
  }
  // Logarithmic scaling after threshold
  return threshold + Math.log(value - threshold + 1) * logScaling;
}

/** Calculate recency boost based on last activity */
function calculateRecencyBoost(daysSinceLastBooking?: number, config?: CredibilityConfig['recencyWindows'] & CredibilityConfig['recencyBoosts']): number {
  if (!daysSinceLastBooking || !config) return 0;
  
  if (daysSinceLastBooking <= config.veryRecent) return config.veryRecent;
  if (daysSinceLastBooking <= config.recent) return config.recent;
  if (daysSinceLastBooking <= config.somewhatRecent) return config.somewhatRecent;
  return 0;
}

/** Calculate inactivity decay penalty */
function calculateInactivityDecay(daysSinceLastBooking?: number, config?: CredibilityConfig['recencyWindows'] & CredibilityConfig['inactivityPenalties']): number {
  if (!daysSinceLastBooking || !config) return 0;
  
  if (daysSinceLastBooking > config.heavyPenaltyThreshold) return config.heavy;
  if (daysSinceLastBooking > config.inactivityThreshold) return config.moderate;
  return 0;
}

/** Calculate badge score impact */
function calculateBadgeImpact(badges?: BadgeDefinition[]): number {
  if (!badges || badges.length === 0) return 0;
  
  return badges.reduce((total, badge) => {
    // Skip expired badges
    if (badge.expiresAt && badge.expiresAt < new Date()) {
      return total;
    }
    return total + (badge.scoreImpact || 0);
  }, 0);
}

/** Calculate response metrics bonus */
function calculateResponseBonus(
  responseRate?: number, 
  avgResponseTimeHours?: number, 
  config?: CredibilityConfig['responseMetrics']
): number {
  if (!config) return 0;
  
  let bonus = 0;
  
  // Response rate bonus (0-100 scale)
  if (responseRate) {
    if (responseRate >= config.excellentResponseRate) bonus += config.bonuses.excellentResponse;
    else if (responseRate >= config.goodResponseRate) bonus += config.bonuses.goodResponse;
    else if (responseRate >= config.decentResponseRate) bonus += config.bonuses.decentResponse;
  }
  
  // Response time bonus  
  if (avgResponseTimeHours) {
    if (avgResponseTimeHours <= config.fastResponseTime) bonus += config.bonuses.fastTime;
    else if (avgResponseTimeHours <= config.goodResponseTime) bonus += config.bonuses.goodTime;
    else if (avgResponseTimeHours <= config.okResponseTime) bonus += config.bonuses.okTime;
  }
  
  return bonus;
}

/**
 * Compute credibility score using tier precedence + AX credits + distinct clients + 
 * verified reviews + badge impact + recency boost + inactivity decay
 */
export function calculateCredibilityScore(
  factors: CredibilityFactors, 
  config: CredibilityConfig = DEFAULT_CONFIG
): number {
  // 1. Tier precedence (base score)
  const tierScore = config.tierWeights[factors.tier];
  
  // 2. AX-Verified credits with diminishing returns
  const axCreditsScore = applyDiminishingReturns(
    factors.axVerifiedCredits * config.creditMultipliers.axVerified,
    config.diminishingReturns.threshold,
    config.diminishingReturns.logScaling
  );
  
  // 3. Client-Confirmed credits (lower weight)
  const clientCreditsScore = applyDiminishingReturns(
    factors.clientConfirmedCredits * config.creditMultipliers.clientConfirmed,
    config.diminishingReturns.threshold,
    config.diminishingReturns.logScaling
  );
  
  // 4. Distinct clients (social proof) - capped
  const clientDiversityScore = Math.min(
    factors.distinctClients90d * config.distinctClientCaps.perClientScore, 
    config.distinctClientCaps.maxImpact
  );
  
  // 5. Positive reviews (social validation)
  const reviewScore = Math.min(factors.positiveReviewCount * 3, 150);
  
  // 6. Badge impact (achievements & performance)
  const badgeScore = calculateBadgeImpact(factors.activeBadges);
  
  // 7. Response metrics bonus
  const responseScore = calculateResponseBonus(
    factors.responseRate, 
    factors.avgResponseTimeHours,
    config.responseMetrics
  );
  
  // 8. Recency boost (recent activity)
  const recencyBoost = calculateRecencyBoost(
    factors.daysSinceLastBooking, 
    { ...config.recencyWindows, ...config.recencyBoosts }
  );
  
  // 9. Inactivity decay (penalize long absence)
  const inactivityPenalty = calculateInactivityDecay(
    factors.daysSinceLastBooking, 
    { ...config.recencyWindows, ...config.inactivityPenalties }
  );
  
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
  profile: any, // UserProfile type
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