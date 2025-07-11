#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔄 Generating TypeScript types from Zod schemas...');

// Create the full type definition file content
const fileContent = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated from Zod schemas in src/lib/schema.ts
 * Run 'npm run gen:types' to regenerate this file
 */

// Re-export types from the schema file
export type {
  User,
  Review,
  LegacyReview,
  Booking,
  Service,
  Contract,
  Notification,
  XPTransaction,
  UserProgress,
  Dispute,
  AssignRoleRequest,
  SetRoleRequest,
  BookingRequest,
  BanUserRequest,
  PromoteUserRequest,
  ContractAgreementRequest,
  BookingConfirmationRequest,
  CheckoutSessionRequest,
  CartCheckoutRequest,
} from './schema';

// Schema field name constants to prevent hardcoded strings
export const SCHEMA_FIELDS = {
  // User fields
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
  // Review fields
  REVIEW: {
    ID: 'id',
    AUTHOR_ID: 'authorId',
    TARGET_ID: 'targetId',
    BOOKING_ID: 'bookingId',
    CONTRACT_ID: 'contractId',
    RATING: 'rating',
    TEXT: 'text',
    CREATED_AT: 'createdAt',
    MIGRATED_AT: 'migratedAt',
    MIGRATION_VERSION: 'migrationVersion',
  },
  // Booking fields
  BOOKING: {
    ID: 'id',
    CLIENT_ID: 'clientId',
    PROVIDER_ID: 'providerId',
    SERVICE_ID: 'serviceId',
    SERVICE_NAME: 'serviceName',
    STATUS: 'status',
    DATETIME: 'datetime',
    TITLE: 'title',
    NOTES: 'notes',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    HAS_REVIEW: 'hasReview',
    PAYMENT_STATUS: 'paymentStatus',
  },
  // Service fields
  SERVICE: {
    ID: 'id',
    CREATOR_ID: 'creatorId',
    TITLE: 'title',
    DESCRIPTION: 'description',
    PRICE: 'price',
    DURATION: 'duration',
    CATEGORY: 'category',
    IS_ACTIVE: 'isActive',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },
  // Contract fields
  CONTRACT: {
    ID: 'id',
    BOOKING_ID: 'bookingId',
    CLIENT_ID: 'clientId',
    PROVIDER_ID: 'providerId',
    TERMS: 'terms',
    AGREED_BY_CLIENT: 'agreedByClient',
    AGREED_BY_PROVIDER: 'agreedByProvider',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },
  // Notification fields
  NOTIFICATION: {
    ID: 'id',
    USER_ID: 'userId',
    TYPE: 'type',
    TITLE: 'title',
    MESSAGE: 'message',
    READ: 'read',
    LINK: 'link',
    CREATED_AT: 'createdAt',
  },
  // XP Transaction fields
  XP_TRANSACTION: {
    ID: 'id',
    USER_ID: 'userId',
    EVENT: 'event',
    XP_AMOUNT: 'xpAmount',
    CONTEXT_ID: 'contextId',
    METADATA: 'metadata',
    CREATED_AT: 'createdAt',
  },
  // User Progress fields
  USER_PROGRESS: {
    USER_ID: 'userId',
    TOTAL_XP: 'totalXP',
    DAILY_XP: 'dailyXP',
    LAST_XP_DATE: 'lastXPDate',
    STREAK: 'streak',
    LAST_ACTIVITY_AT: 'lastActivityAt',
    TIER: 'tier',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },
  // Dispute fields
  DISPUTE: {
    ID: 'id',
    BOOKING_ID: 'bookingId',
    CLIENT_ID: 'clientId',
    PROVIDER_ID: 'providerId',
    REASON: 'reason',
    DESCRIPTION: 'description',
    STATUS: 'status',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },
} as const;

// Type-safe field name access
export type SchemaFieldNames = typeof SCHEMA_FIELDS;
export type UserFieldNames = SchemaFieldNames['USER'];
export type ReviewFieldNames = SchemaFieldNames['REVIEW'];
export type BookingFieldNames = SchemaFieldNames['BOOKING'];
export type ServiceFieldNames = SchemaFieldNames['SERVICE'];
export type ContractFieldNames = SchemaFieldNames['CONTRACT'];
export type NotificationFieldNames = SchemaFieldNames['NOTIFICATION'];
export type XPTransactionFieldNames = SchemaFieldNames['XP_TRANSACTION'];
export type UserProgressFieldNames = SchemaFieldNames['USER_PROGRESS'];
export type DisputeFieldNames = SchemaFieldNames['DISPUTE'];
`;

// Write the generated types to the output file
const outputPath = join(__dirname, '..', 'src', 'lib', '@schema.d.ts');
writeFileSync(outputPath, fileContent, 'utf-8');

console.log('✅ TypeScript types generated successfully!');
console.log(`📄 Output file: ${outputPath}`);
console.log('📋 Generated schema field constants for type-safe field access');