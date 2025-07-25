import { z } from 'zod';

/**
 * Unified User Schema
 * 
 * This schema consolidates the overlapping user models from:
 * - backend/models/User.js (Mongoose)
 * - src/lib/schema.ts (Firestore)
 * - Next-Auth user sessions
 * 
 * Adds new fields required by audit findings:
 * - verificationStatus (for KYC)
 * - walletId (for payments)
 * - Enhanced tier system
 * - XP and ranking system
 */

export const UnifiedUserSchema = z.object({
  // Core Identity Fields
  uid: z.string(), // Primary key - Firebase Auth UID
  email: z.string().email(),
  displayName: z.string().optional().nullable(),
  name: z.string().optional(), // Backward compatibility with Mongoose model
  
  // Authentication Fields (migrated from Mongoose)
  emailVerified: z.boolean().default(false),
  lastSignIn: z.date().optional(),
  
  // Role and Permissions
  role: z.enum(['client', 'creator', 'admin', 'buyer', 'artist', 'producer', 'engineer', 'studio', 'videographer', 'moderator']).default('client'),
  
  // Tier System (audit requirement)
  tier: z.enum(['standard', 'verified', 'signature']).default('standard'),
  
  // Verification Status (KYC requirement)
  verificationStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).default('unverified'),
  verificationDocuments: z.array(z.string()).optional(), // Document IDs
  verifiedAt: z.date().optional(),
  
  // Gamification (XP System)
  xp: z.number().min(0).default(0),
  rankScore: z.number().min(0).default(0),
  
  // Rating and Reviews
  averageRating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).default(0),
  
  // Financial Fields
  walletId: z.string().optional(), // Stripe customer/account ID
  paymentMethodsSetup: z.boolean().default(false),
  
  // Profile Fields
  bio: z.string().max(1000).optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  socialLinks: z.record(z.string().url()).optional(),
  profilePicture: z.string().url().optional(),
  
  // Settings and Preferences
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }).default({}),
  
  // Privacy Settings
  profileVisibility: z.enum(['public', 'registered', 'private']).default('public'),
  
  // Audit Trail
  createdAt: z.date(),
  updatedAt: z.date(),
  
  // Migration Metadata
  migratedFrom: z.enum(['mongoose', 'firestore', 'nextauth']).optional(),
  migrationVersion: z.string().optional(),
  migratedAt: z.date().optional(),
  
  // Soft Delete
  isActive: z.boolean().default(true),
  deletedAt: z.date().optional(),
});

// Derived schemas for different use cases
export const PublicUserSchema = UnifiedUserSchema.pick({
  uid: true,
  displayName: true,
  role: true,
  tier: true,
  verificationStatus: true,
  averageRating: true,
  reviewCount: true,
  bio: true,
  location: true,
  website: true,
  profilePicture: true,
  createdAt: true,
});

export const PrivateUserSchema = UnifiedUserSchema.omit({
  walletId: true,
  paymentMethodsSetup: true,
  verificationDocuments: true,
});

// User creation schema (for new registrations)
export const CreateUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  role: z.enum(['client', 'creator']).default('client'),
  bio: z.string().max(1000).optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
});

// User update schema (for profile updates)
export const UpdateUserSchema = UnifiedUserSchema.partial().omit({
  uid: true,
  email: true,
  createdAt: true,
  migratedFrom: true,
  migrationVersion: true,
  migratedAt: true,
});

// Verification update schema (for KYC workflow)
export const VerificationUpdateSchema = z.object({
  verificationStatus: z.enum(['pending', 'verified', 'rejected']),
  verificationDocuments: z.array(z.string()).optional(),
  verifiedAt: z.date().optional(),
  tier: z.enum(['verified', 'signature']).optional(), // Can upgrade tier upon verification
});

// Type exports
export type UnifiedUser = z.infer<typeof UnifiedUserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type PrivateUser = z.infer<typeof PrivateUserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type VerificationUpdate = z.infer<typeof VerificationUpdateSchema>;

// Validation functions
export const validateUnifiedUser = (data: unknown): UnifiedUser => {
  return UnifiedUserSchema.parse(data);
};

export const validateCreateUser = (data: unknown): CreateUser => {
  return CreateUserSchema.parse(data);
};

export const validateUpdateUser = (data: unknown): UpdateUser => {
  return UpdateUserSchema.parse(data);
};

export const validateVerificationUpdate = (data: unknown): VerificationUpdate => {
  return VerificationUpdateSchema.parse(data);
};

// Helper functions for user transformations
export const toPublicUser = (user: UnifiedUser): PublicUser => {
  return PublicUserSchema.parse(user);
};

export const toPrivateUser = (user: UnifiedUser): PrivateUser => {
  return PrivateUserSchema.parse(user);
};

// User role checking utilities
export const isAdmin = (user: UnifiedUser): boolean => {
  return user.role === 'admin';
};

export const isCreator = (user: UnifiedUser): boolean => {
  return ['creator', 'artist', 'producer', 'engineer', 'studio', 'videographer'].includes(user.role);
};

export const isVerified = (user: UnifiedUser): boolean => {
  return user.verificationStatus === 'verified';
};

export const canProvideServices = (user: UnifiedUser): boolean => {
  return isCreator(user) && user.tier !== 'standard';
};

export const getDisplayName = (user: UnifiedUser): string => {
  return user.displayName || user.name || user.email.split('@')[0];
};