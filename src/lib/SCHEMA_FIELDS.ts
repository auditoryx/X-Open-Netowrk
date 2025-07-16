// Centralized schema field constants for type safety and lint compliance
// Add all relevant schema field names here as needed

export const SCHEMA_FIELDS = {
  // User fields
  USER: {
    USER_ID: 'userId',
    EMAIL: 'email',
    DISPLAY_NAME: 'displayName',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    ROLE: 'role',
    XP: 'xp',
    VERIFICATION: 'verification',
    RANK: 'rank',
    BADGES: 'badges',
    CHALLENGES: 'challenges',
    AVERAGE_RATING: 'averageRating',
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

  // Mentorship Booking fields
  MENTORSHIP_BOOKING: {
    CLIENT_UID: 'clientUid',
    CREATOR_UID: 'creatorUid',
    STATUS: 'status',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
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
