// Schema field constants to avoid hardcoding field names
export const SCHEMA_FIELDS = {
  REVIEW: {
    AUTHOR_ID: 'authorId',
    TARGET_ID: 'targetId',
    BOOKING_ID: 'bookingId',
    CONTRACT_ID: 'contractId',
    RATING: 'rating',
    TEXT: 'text',
    CREATED_AT: 'createdAt',
    MIGRATED_AT: 'migratedAt',
    MIGRATION_VERSION: 'migrationVersion',
    // Legacy fields for backward compatibility
    REVIEWER_ID: 'reviewerId',
    REVIEWED_ID: 'reviewedId',
  },
  USER: {
    ID: 'id',
    EMAIL: 'email',
    NAME: 'name',
    ROLE: 'role',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    AVERAGE_RATING: 'averageRating',
    REVIEW_COUNT: 'reviewCount',
    TIER: 'tier',
    XP: 'xp',
    RANK_SCORE: 'rankScore',
  },
  BOOKING: {
    ID: 'id',
    CLIENT_ID: 'clientId',
    PROVIDER_ID: 'providerId',
    SERVICE_ID: 'serviceId',
    SERVICE_NAME: 'serviceName',
    STATUS: 'status',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },
  NOTIFICATION: {
    USER_ID: 'userId',
    TYPE: 'type',
    MESSAGE: 'message',
    READ: 'read',
  },
  SERVICE: {
    CREATOR_ID: 'creatorId',
    DESCRIPTION: 'description',
    CATEGORY: 'category',
    PRICE: 'price',
    DURATION: 'duration',
  },
  XP_TRANSACTION: {
    EVENT: 'event',
    XP_AMOUNT: 'xpAmount',
  }
} as const;