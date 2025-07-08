import { z } from 'zod';

// User schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['client', 'creator', 'admin']).optional(),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
  averageRating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  tier: z.enum(['standard', 'verified', 'signature']).optional(),
  xp: z.number().min(0).optional(),
  rankScore: z.number().min(0).optional(),
});

// Review schema with new field names
export const ReviewSchema = z.object({
  id: z.string().optional(),
  authorId: z.string(), // Migrated from reviewerId
  targetId: z.string(), // Migrated from reviewedId
  bookingId: z.string(),
  contractId: z.string().optional(),
  rating: z.number().min(1).max(5),
  text: z.string().min(1).max(1000),
  createdAt: z.any(), // Firestore Timestamp
  migratedAt: z.any().optional(), // Firestore Timestamp - migration metadata
  migrationVersion: z.string().optional(), // Migration version
});

// Legacy review schema (for backward compatibility checks)
export const LegacyReviewSchema = z.object({
  id: z.string().optional(),
  reviewerId: z.string(), // Legacy field
  reviewedId: z.string(), // Legacy field
  bookingId: z.string(),
  contractId: z.string().optional(),
  rating: z.number().min(1).max(5),
  text: z.string().min(1).max(1000),
  createdAt: z.any(), // Firestore Timestamp
});

// Booking schema
export const BookingSchema = z.object({
  id: z.string().optional(),
  clientId: z.string(),
  providerId: z.string(),
  serviceId: z.string(),
  serviceName: z.string(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  datetime: z.string(),
  title: z.string(),
  notes: z.string().optional(),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any().optional(), // Firestore Timestamp
  hasReview: z.boolean().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'held', 'released']).optional(),
});

// Service schema
export const ServiceSchema = z.object({
  id: z.string().optional(),
  creatorId: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number().min(0),
  duration: z.number().min(0),
  category: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any().optional(), // Firestore Timestamp
});

// Contract schema
export const ContractSchema = z.object({
  id: z.string().optional(),
  bookingId: z.string(),
  clientId: z.string(),
  providerId: z.string(),
  terms: z.string(),
  agreedByClient: z.boolean().default(false),
  agreedByProvider: z.boolean().default(false),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any().optional(), // Firestore Timestamp
});

// Notification schema
export const NotificationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  type: z.enum(['booking', 'review', 'payment', 'system']),
  title: z.string(),
  message: z.string(),
  read: z.boolean().default(false),
  link: z.string().optional(),
  createdAt: z.any(), // Firestore Timestamp
});

// XP Transaction schema
export const XPTransactionSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  event: z.string(),
  xpAmount: z.number(),
  contextId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.any(), // Firestore Timestamp
});

// User Progress schema
export const UserProgressSchema = z.object({
  userId: z.string(),
  totalXP: z.number().min(0),
  dailyXP: z.number().min(0),
  lastXPDate: z.any(), // Firestore Timestamp
  streak: z.number().min(0),
  lastActivityAt: z.any(), // Firestore Timestamp
  tier: z.enum(['standard', 'verified', 'signature']),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
});

// Dispute schema
export const DisputeSchema = z.object({
  id: z.string().optional(),
  bookingId: z.string(),
  clientId: z.string(),
  providerId: z.string(),
  reason: z.string(),
  description: z.string(),
  status: z.enum(['open', 'investigating', 'resolved', 'closed']),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any().optional(), // Firestore Timestamp
});

// Export types
export type User = z.infer<typeof UserSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type LegacyReview = z.infer<typeof LegacyReviewSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type Contract = z.infer<typeof ContractSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type XPTransaction = z.infer<typeof XPTransactionSchema>;
export type UserProgress = z.infer<typeof UserProgressSchema>;
export type Dispute = z.infer<typeof DisputeSchema>;

// Validation helper functions
export const validateReview = (data: unknown): Review => {
  return ReviewSchema.parse(data);
};

export const validateLegacyReview = (data: unknown): LegacyReview => {
  return LegacyReviewSchema.parse(data);
};

export const validateBooking = (data: unknown): Booking => {
  return BookingSchema.parse(data);
};

export const validateUser = (data: unknown): User => {
  return UserSchema.parse(data);
};

export const validateService = (data: unknown): Service => {
  return ServiceSchema.parse(data);
};

export const validateContract = (data: unknown): Contract => {
  return ContractSchema.parse(data);
};

export const validateNotification = (data: unknown): Notification => {
  return NotificationSchema.parse(data);
};

export const validateXPTransaction = (data: unknown): XPTransaction => {
  return XPTransactionSchema.parse(data);
};

export const validateUserProgress = (data: unknown): UserProgress => {
  return UserProgressSchema.parse(data);
};

export const validateDispute = (data: unknown): Dispute => {
  return DisputeSchema.parse(data);
};