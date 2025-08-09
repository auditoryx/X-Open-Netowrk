/** AX Beta Feature Flags for gradual rollout */
export const AX_BETA_FEATURES = {
  // Phase A flags
  EXPOSE_SCORE_V1: process.env.NEXT_PUBLIC_EXPOSE_SCORE_V1 === 'true',
  BYO_LINKS: process.env.NEXT_PUBLIC_BYO_LINKS === 'true',
  
  // Phase B flags
  LANE_NUDGES: process.env.NEXT_PUBLIC_LANE_NUDGES === 'true',
  FIRST_SCREEN_MIX: process.env.NEXT_PUBLIC_FIRST_SCREEN_MIX === 'true',
  DYNAMIC_BADGE_EXPIRY: process.env.NEXT_PUBLIC_DYNAMIC_BADGE_EXPIRY === 'true',
  
  // Phase C flags
  CASE_STUDIES: process.env.NEXT_PUBLIC_CASE_STUDIES === 'true',
  POSITIVE_REVIEWS_ONLY: process.env.NEXT_PUBLIC_POSITIVE_REVIEWS_ONLY === 'true',
  CREDIBILITY_VISIBILITY: process.env.NEXT_PUBLIC_CREDIBILITY_VISIBILITY === 'true',
  
  // Admin/Debug flags
  SHOW_DEBUG_INFO: process.env.NEXT_PUBLIC_SHOW_DEBUG_INFO === 'true',
  FORCE_BADGE_REFRESH: process.env.NEXT_PUBLIC_FORCE_BADGE_REFRESH === 'true'
} as const;

/** Feature flag utility functions */
export const FeatureFlags = {
  /** Check if a feature is enabled */
  isEnabled: (feature: keyof typeof AX_BETA_FEATURES): boolean => {
    return AX_BETA_FEATURES[feature];
  },

  /** Check if we're in Phase A rollout */
  isPhaseA: (): boolean => {
    return AX_BETA_FEATURES.EXPOSE_SCORE_V1 || AX_BETA_FEATURES.BYO_LINKS;
  },

  /** Check if we're in Phase B rollout */
  isPhaseB: (): boolean => {
    return AX_BETA_FEATURES.LANE_NUDGES || AX_BETA_FEATURES.FIRST_SCREEN_MIX;
  },

  /** Check if we're in Phase C rollout */
  isPhaseC: (): boolean => {
    return AX_BETA_FEATURES.CASE_STUDIES || AX_BETA_FEATURES.POSITIVE_REVIEWS_ONLY;
  },

  /** Get current rollout phase */
  getCurrentPhase: (): 'none' | 'A' | 'B' | 'C' => {
    if (FeatureFlags.isPhaseC()) return 'C';
    if (FeatureFlags.isPhaseB()) return 'B';
    if (FeatureFlags.isPhaseA()) return 'A';
    return 'none';
  }
};

/** Visibility levels for credibility indicators */
export const CREDIBILITY_VISIBILITY_LEVELS = {
  LOW: 'low',
  MODERATE: 'moderate', 
  HIGH: 'high'
} as const;

export type CredibilityVisibilityLevel = typeof CREDIBILITY_VISIBILITY_LEVELS[keyof typeof CREDIBILITY_VISIBILITY_LEVELS];

/** Get visibility level based on credibility score */
export function getCredibilityVisibilityLevel(credibilityScore: number): CredibilityVisibilityLevel {
  if (credibilityScore >= 1000) return CREDIBILITY_VISIBILITY_LEVELS.HIGH;
  if (credibilityScore >= 500) return CREDIBILITY_VISIBILITY_LEVELS.MODERATE;
  return CREDIBILITY_VISIBILITY_LEVELS.LOW;
}

/** Action hints for improving visibility */
export const VISIBILITY_ACTION_HINTS = {
  [CREDIBILITY_VISIBILITY_LEVELS.LOW]: [
    'Complete your first session',
    'Add portfolio samples',
    'Respond quickly to messages',
    'Invite a client with BYO link'
  ],
  [CREDIBILITY_VISIBILITY_LEVELS.MODERATE]: [
    'Maintain 5-star rating streak',
    'Invite clients with BYO links',
    'Publish a case study',
    'Complete bookings on time'
  ],
  [CREDIBILITY_VISIBILITY_LEVELS.HIGH]: [
    'Continue excellent service',
    'Share case studies regularly', 
    'Mentor new creators',
    'Maintain response time under 2 hours'
  ]
} as const;

/** Role-specific explore tabs */
export const EXPLORE_ROLE_TABS = [
  { key: 'artist', label: 'Artists', icon: '🎤' },
  { key: 'producer', label: 'Producers', icon: '🎛️' },
  { key: 'engineer', label: 'Engineers', icon: '🎚️' },
  { key: 'videographer', label: 'Videographers', icon: '🎥' },
  { key: 'studio', label: 'Studios', icon: '🏢' }
] as const;

/** Tier badge display information */
export const TIER_BADGES = {
  standard: {
    label: 'Standard',
    icon: '🆓',
    color: 'bg-gray-100 text-gray-800',
    description: 'New to AuditoryX'
  },
  verified: {
    label: 'Verified', 
    icon: '✅',
    color: 'bg-blue-100 text-blue-800',
    description: 'Established creator'
  },
  signature: {
    label: 'Signature',
    icon: '👑', 
    color: 'bg-purple-100 text-purple-800',
    description: 'Top-tier talent'
  }
} as const;

/** Explore mix ratios (can be adjusted via feature flags) */
export const EXPLORE_MIX_RATIOS = {
  default: {
    top: 0.7,
    rising: 0.2,
    newThisWeek: 0.1
  },
  // Alternative ratios for A/B testing
  balanced: {
    top: 0.6,
    rising: 0.25,
    newThisWeek: 0.15
  },
  discovery: {
    top: 0.5,
    rising: 0.3,
    newThisWeek: 0.2
  }
} as const;