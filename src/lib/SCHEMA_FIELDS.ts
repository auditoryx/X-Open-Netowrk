// Centralized schema field constants for type safety and lint compliance
// Add all relevant schema field names here as needed

export const SCHEMA_FIELDS = {
  USER_ID: SCHEMA_FIELDS.NOTIFICATION.USER_ID,
  EMAIL: SCHEMA_FIELDS.USER.EMAIL,
  DISPLAY_NAME: 'displayName',
  CREATED_AT: SCHEMA_FIELDS.USER.CREATED_AT,
  UPDATED_AT: SCHEMA_FIELDS.USER.UPDATED_AT,
  ROLE: SCHEMA_FIELDS.USER.ROLE,
  STATUS: SCHEMA_FIELDS.BOOKING.STATUS,
  BOOKING_ID: SCHEMA_FIELDS.REVIEW.BOOKING_ID,
  AMOUNT: 'amount',
  EARNINGS: 'earnings',
  BADGES: 'badges',
  XP: SCHEMA_FIELDS.USER.XP,
  VERIFICATION: 'verification',
  RANK: 'rank',
  CHALLENGES: 'challenges',
  SEASON: 'season',
  // Add more fields as needed
};
