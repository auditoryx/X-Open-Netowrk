/** Badge category types */
export type BadgeCategory = 
  | 'milestone'      // Achievement-based (auto)
  | 'performance'    // Performance-based (auto)  
  | 'dynamic'        // Time-limited (auto, expires)
  | 'prestige'       // Admin-only approval required
  | 'special';       // Admin-only, special occasions

/** Badge assignment type */
export type BadgeAssignmentType = 'auto' | 'admin';

/** Badge status for user assignments */
export type BadgeStatus = 'active' | 'expired' | 'revoked';

/** Badge definition stored in badgeDefinitions collection */
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  assignmentType: BadgeAssignmentType;
  icon: string; // emoji or icon identifier
  scoreImpact: number; // positive/negative impact on credibility score
  criteria?: {
    // Auto badge criteria (when assignmentType === 'auto')
    minBookings?: number;
    minRating?: number;
    minReviews?: number;
    minCredits?: number;
    maxResponseTime?: number; // hours
    minResponseRate?: number; // percentage
    timeframe?: 'all_time' | '90d' | '30d' | '7d';
    // Dynamic badge TTL
    ttlDays?: number; // for dynamic badges
  };
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

/** User badge assignment stored in user.badgeIds array or separate collection */
export interface UserBadge {
  badgeId: string;
  userId: string;
  assignedAt: any; // Firestore Timestamp
  assignedBy?: string; // uid of admin who assigned (for admin badges)
  status: BadgeStatus;
  expiresAt?: any; // Firestore Timestamp for dynamic badges
  metadata?: {
    // Context when badge was assigned
    triggerBookingId?: string;
    triggerReviewId?: string;
    autoAssigned?: boolean;
  };
}

/** Badge display information for UI */
export interface BadgeDisplay {
  id: string;
  name: string;
  icon: string;
  category: BadgeCategory;
  isActive: boolean;
}

/** Predefined badge IDs for core system badges */
export const CORE_BADGE_IDS = {
  // Milestone badges
  FIRST_BOOKING: 'first-booking',
  MILESTONE_10_BOOKINGS: 'milestone-10-bookings', 
  MILESTONE_50_BOOKINGS: 'milestone-50-bookings',
  MILESTONE_100_BOOKINGS: 'milestone-100-bookings',
  
  // Performance badges  
  FIVE_STAR_STREAK: 'five-star-streak',
  FAST_RESPONDER: 'fast-responder',
  HIGH_COMPLETION_RATE: 'high-completion-rate',
  CLIENT_FAVORITE: 'client-favorite',
  
  // Dynamic badges (time-limited)
  RISING_TALENT: 'rising-talent',
  TRENDING_NOW: 'trending-now',
  NEW_THIS_WEEK: 'new-this-week',
  
  // Prestige badges (admin-only)
  VERIFIED_PRO: 'verified-pro',
  SIGNATURE_ARTIST: 'signature-artist',
  PLATFORM_PIONEER: 'platform-pioneer',
  COMMUNITY_LEADER: 'community-leader'
} as const;

export type CoreBadgeId = typeof CORE_BADGE_IDS[keyof typeof CORE_BADGE_IDS];