// Centralized schema field constants for type safety and lint compliance
// Add all relevant schema field names here as needed

export const SCHEMA_FIELDS = {
  // User fields
  USER: {
    UID: 'uid',
    USER_ID: 'userId',
    EMAIL: 'email',
    DISPLAY_NAME: 'displayName',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    ROLE: 'role',
    TIER: 'tier',
    XP: 'xp',
    VERIFICATION: 'verification',
    RANK: 'rank',
    BADGES: 'badges',
    BADGE_IDS: 'badgeIds',
    CHALLENGES: 'challenges',
    AVERAGE_RATING: 'averageRating',
    REVIEW_COUNT: 'reviewCount',
    CREDIBILITY_SCORE: 'credibilityScore',
    POSITIVE_REVIEW_COUNT: 'positiveReviewCount',
    COMPLETED_BOOKINGS: 'completedBookings',
    STATS: 'stats',
    COUNTS: 'counts',
  },

  // Service fields
  SERVICE: {
    CREATOR_ID: 'creatorId',
    SERVICE_ID: 'serviceId',
    TITLE: 'title',
    DESCRIPTION: 'description',
    CATEGORY: 'category',
    PRICE: 'price',
    DURATION: 'duration',
    STATUS: 'status',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },

  // Booking fields
  BOOKING: {
    STATUS: 'status',
    BOOKING_ID: 'bookingId',
    PROVIDER_ID: 'providerId',
    CLIENT_ID: 'clientId',
    AMOUNT: 'amount',
    EARNINGS: 'earnings',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    SERVICE_ID: 'serviceId',
    TITLE: 'title',
  },

  // Review fields
  REVIEW: {
    BOOKING_ID: 'bookingId',
    RATING: 'rating',
    COMMENT: 'comment',
    CREATED_AT: 'createdAt',
  },

  // Notification fields
  NOTIFICATION: {
    USER_ID: 'userId',
    TYPE: 'type',
    MESSAGE: 'message',
    READ: 'read',
    CREATED_AT: 'createdAt',
  },

  // Booking Request fields
  BOOKING_REQUEST: {
    CLIENT_ID: 'clientId',
    PROVIDER_ID: 'providerId',
    SERVICE_ID: 'serviceId',
    STATUS: 'status',
    MESSAGE: 'message',
    PRICE: 'price',
    DURATION: 'duration',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },

  // XP Transaction fields
  XP_TRANSACTION: {
    EVENT: 'event',
    XP_AMOUNT: 'xpAmount',
    USER_ID: 'userId',
    CREATED_AT: 'createdAt',
  },

  // Escrow fields
  ESCROW: {
    PROVIDER_ID: 'providerId',
    CUSTOMER_ID: 'customerId',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    STATUS: 'status',
    AMOUNT: 'amount',
  },

  // Mentorship Booking fields
  MENTORSHIP_BOOKING: {
    CLIENT_UID: 'clientUid',
    CREATOR_UID: 'creatorUid',
    STATUS: 'status',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },

  // User Progress fields
  USER_PROGRESS: {
    TOTAL_XP: 'totalXp',
    WEEKLY_XP: 'weeklyXp',
    MONTHLY_XP: 'monthlyXp',
    CURRENT_STREAK: 'currentStreak',
    LONGEST_STREAK: 'longestStreak',
    CHALLENGES_COMPLETED: 'challengesCompleted',
    BADGES_EARNED: 'badgesEarned',
    LEVEL: 'level',
    RANK: 'rank',
  },

  // Moderation fields
  MODERATION: {
    STATUS: 'status',
    MODERATOR_ID: 'moderatorId',
    REVIEWED_AT: 'reviewedAt',
    REASON: 'reason',
    QUEUE_ID: 'queueId',
  },

  // Report fields
  REPORT: {
    STATUS: 'status',
    REPORTER_ID: 'reporterId',
    REPORTED_ID: 'reportedId',
    REPORT_TYPE: 'reportType',
    DESCRIPTION: 'description',
    CREATED_AT: 'createdAt',
    RESOLVED_AT: 'resolvedAt',
  },

  // Common fields
  SEASON: 'season',
  AMOUNT: 'amount',
  EARNINGS: 'earnings',
  BADGES: 'badges',
  VERIFICATION: 'verification',
  RANK: 'rank',
  CHALLENGES: 'challenges',
  EVENT_TYPE: 'eventType',
};
