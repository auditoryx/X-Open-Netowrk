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

/** Badge definition for scoring impact */
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  scoreImpact?: number;
  type: 'achievement' | 'performance' | 'dynamic';
  expiresAt?: Date;
}

/** Configuration for credibility scoring algorithm */
export interface CredibilityConfig {
  tierWeights: {
    signature: number;
    verified: number;
    standard: number;
  };
  creditMultipliers: {
    axVerified: number;
    clientConfirmed: number;
    selfReported: number;
  };
  distinctClientCaps: {
    maxImpact: number;
    perClientScore: number;
    windowDays: number;
  };
  recencyWindows: {
    veryRecent: number;
    recent: number;
    somewhatRecent: number;
    inactivityThreshold: number;
    heavyPenaltyThreshold: number;
  };
  recencyBoosts: {
    veryRecent: number;
    recent: number;
    somewhatRecent: number;
  };
  inactivityPenalties: {
    moderate: number;
    heavy: number;
  };
  diminishingReturns: {
    threshold: number;
    logScaling: number;
  };
  responseMetrics: {
    excellentResponseRate: number;
    goodResponseRate: number;
    decentResponseRate: number;
    fastResponseTime: number;
    goodResponseTime: number;
    okResponseTime: number;
    bonuses: {
      excellentResponse: number;
      goodResponse: number;
      decentResponse: number;
      fastTime: number;
      goodTime: number;
      okTime: number;
    };
  };
}