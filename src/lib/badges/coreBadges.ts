import { BadgeDefinition, CORE_BADGE_IDS } from '@/types/badge';

/** Core badge definitions for the AX system */
export const CORE_BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Milestone badges
  {
    id: CORE_BADGE_IDS.FIRST_BOOKING,
    name: 'First Booking',
    description: 'Completed your first booking on AuditoryX',
    category: 'milestone',
    assignmentType: 'auto',
    icon: '🎯',
    scoreImpact: 10,
    criteria: {
      minBookings: 1,
      timeframe: 'all_time'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: CORE_BADGE_IDS.MILESTONE_10_BOOKINGS,
    name: '10 Bookings',
    description: 'Completed 10 bookings on AuditoryX',
    category: 'milestone', 
    assignmentType: 'auto',
    icon: '🔟',
    scoreImpact: 25,
    criteria: {
      minBookings: 10,
      timeframe: 'all_time'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: CORE_BADGE_IDS.MILESTONE_50_BOOKINGS,
    name: '50 Bookings',
    description: 'Completed 50 bookings on AuditoryX',
    category: 'milestone',
    assignmentType: 'auto', 
    icon: '💯',
    scoreImpact: 50,
    criteria: {
      minBookings: 50,
      timeframe: 'all_time'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: CORE_BADGE_IDS.MILESTONE_100_BOOKINGS,
    name: '100 Bookings',
    description: 'Completed 100 bookings on AuditoryX',
    category: 'milestone',
    assignmentType: 'auto',
    icon: '🏆',
    scoreImpact: 100,
    criteria: {
      minBookings: 100, 
      timeframe: 'all_time'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Performance badges
  {
    id: CORE_BADGE_IDS.FIVE_STAR_STREAK,
    name: '5-Star Streak',
    description: 'Received 5 consecutive 5-star reviews',
    category: 'performance',
    assignmentType: 'auto',
    icon: '⭐',
    scoreImpact: 30,
    criteria: {
      minRating: 5.0,
      minReviews: 5,
      timeframe: '90d'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: CORE_BADGE_IDS.FAST_RESPONDER,
    name: 'Fast Responder',
    description: 'Averages under 2 hours response time',
    category: 'performance',
    assignmentType: 'auto', 
    icon: '⚡',
    scoreImpact: 20,
    criteria: {
      maxResponseTime: 2,
      minResponseRate: 80,
      timeframe: '30d'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: CORE_BADGE_IDS.HIGH_COMPLETION_RATE,
    name: 'High Completion Rate',
    description: 'Maintains 95%+ booking completion rate',
    category: 'performance',
    assignmentType: 'auto',
    icon: '✅',
    scoreImpact: 25,
    criteria: {
      minBookings: 10,
      // Note: completion rate logic would be calculated separately
      timeframe: '90d'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: CORE_BADGE_IDS.CLIENT_FAVORITE,
    name: 'Client Favorite',
    description: 'High repeat client rate - clients love working with you',
    category: 'performance',
    assignmentType: 'auto',
    icon: '💖',
    scoreImpact: 35,
    criteria: {
      minBookings: 15,
      // Note: repeat client logic would be calculated separately
      timeframe: '90d'
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Dynamic badges (time-limited)
  {
    id: CORE_BADGE_IDS.RISING_TALENT,
    name: 'Rising Talent',
    description: 'Rapidly growing in bookings and ratings',
    category: 'dynamic',
    assignmentType: 'auto',
    icon: '🚀',
    scoreImpact: 40,
    criteria: {
      minBookings: 3,
      timeframe: '30d',
      ttlDays: 30
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: CORE_BADGE_IDS.TRENDING_NOW,
    name: 'Trending Now',
    description: 'High booking activity this week',
    category: 'dynamic',
    assignmentType: 'auto',
    icon: '📈',
    scoreImpact: 25,
    criteria: {
      minBookings: 2,
      timeframe: '7d',
      ttlDays: 7
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: CORE_BADGE_IDS.NEW_THIS_WEEK,
    name: 'New This Week',
    description: 'Recently joined AuditoryX',
    category: 'dynamic',
    assignmentType: 'auto',
    icon: '✨',
    scoreImpact: 15,
    criteria: {
      timeframe: '7d',
      ttlDays: 14
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Prestige badges (admin-only)
  {
    id: CORE_BADGE_IDS.VERIFIED_PRO,
    name: 'Verified Pro',
    description: 'Verified professional with outstanding track record',
    category: 'prestige',
    assignmentType: 'admin',
    icon: '🏅',
    scoreImpact: 75,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: CORE_BADGE_IDS.SIGNATURE_ARTIST,
    name: 'Signature Artist',
    description: 'Top-tier talent recognized by AuditoryX',
    category: 'prestige',
    assignmentType: 'admin',
    icon: '👑',
    scoreImpact: 100,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: CORE_BADGE_IDS.PLATFORM_PIONEER,
    name: 'Platform Pioneer', 
    description: 'Early adopter who helped shape AuditoryX',
    category: 'prestige',
    assignmentType: 'admin',
    icon: '🗺️',
    scoreImpact: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: CORE_BADGE_IDS.COMMUNITY_LEADER,
    name: 'Community Leader',
    description: 'Exceptional contributor to the AuditoryX community',
    category: 'prestige',
    assignmentType: 'admin',
    icon: '🌟',
    scoreImpact: 60,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];