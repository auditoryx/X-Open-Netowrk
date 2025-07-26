import { z } from 'zod';
import { SCHEMA_FIELDS } from "./SCHEMA_FIELDS";

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
  amount: z.number().min(0).optional(),
  currency: z.string().default('usd').optional(),
  paymentIntentId: z.string().optional(),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any().optional(), // Firestore Timestamp
  hasReview: z.boolean().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'held', 'released']).optional(),
  // Cancellation fields
  cancelledAt: z.any().optional(), // Firestore Timestamp
  cancelledBy: z.string().optional(), // User ID who cancelled
  cancellationReason: z.string().optional(),
  refundCalculation: z.object({
    originalAmount: z.number(),
    refundAmount: z.number(),
    refundPercentage: z.number(),
    processingFee: z.number(),
    policyApplied: z.string()
  }).optional(),
  refundResult: z.object({
    refundId: z.string(),
    amount: z.number(),
    status: z.string()
  }).optional(),
  refundError: z.string().optional(),
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

// =============================================================================
// API REQUEST/RESPONSE SCHEMAS
// =============================================================================

// Role management schemas
export const AssignRoleSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(['user', 'artist', 'producer', 'engineer', 'studio', 'videographer', 'admin', 'moderator']),
});

export const SetRoleSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(['user', 'artist', 'producer', 'engineer', 'studio', 'videographer', 'admin', 'moderator']),
});

// Booking request schema
export const BookingRequestSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  message: z.string().min(1),
  quote: z.number().positive().optional(),
});

// Ban user schema
export const BanUserSchema = z.object({
  uid: z.string().min(1),
  reason: z.string().min(1),
  duration: z.number().positive().optional(), // Duration in days
});

// Promote user schema
export const PromoteUserSchema = z.object({
  uid: z.string().min(1),
  tier: z.enum(['standard', 'verified', 'signature']),
});

// Contract agreement schema
export const ContractAgreementSchema = z.object({
  contractId: z.string().min(1),
  agreementType: z.enum(['client', 'provider']),
});

// Booking confirmation schema
export const BookingConfirmationSchema = z.object({
  bookingId: z.string().min(1),
  recipientEmail: z.string().email(),
  customMessage: z.string().optional(),
});

// Checkout session schema
export const CheckoutSessionSchema = z.object({
  priceId: z.string().min(1),
  bookingId: z.string().min(1).optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

// Cart checkout schema
export const CartCheckoutSchema = z.object({
  items: z.array(z.object({
    serviceId: z.string().min(1),
    quantity: z.number().positive(),
    price: z.number().positive(),
  })),
  customerId: z.string().min(1),
});

// Export API schema types
export type AssignRoleRequest = z.infer<typeof AssignRoleSchema>;
export type SetRoleRequest = z.infer<typeof SetRoleSchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type BanUserRequest = z.infer<typeof BanUserSchema>;
export type PromoteUserRequest = z.infer<typeof PromoteUserSchema>;
export type ContractAgreementRequest = z.infer<typeof ContractAgreementSchema>;
export type BookingConfirmationRequest = z.infer<typeof BookingConfirmationSchema>;
export type CheckoutSessionRequest = z.infer<typeof CheckoutSessionSchema>;
export type CartCheckoutRequest = z.infer<typeof CartCheckoutSchema>;

// API validation helper functions
export const validateAssignRole = (data: unknown): AssignRoleRequest => {
  return AssignRoleSchema.parse(data);
};

export const validateSetRole = (data: unknown): SetRoleRequest => {
  return SetRoleSchema.parse(data);
};

export const validateBookingRequest = (data: unknown): BookingRequest => {
  return BookingRequestSchema.parse(data);
};

export const validateBanUser = (data: unknown): BanUserRequest => {
  return BanUserSchema.parse(data);
};

export const validatePromoteUser = (data: unknown): PromoteUserRequest => {
  return PromoteUserSchema.parse(data);
};

export const validateContractAgreement = (data: unknown): ContractAgreementRequest => {
  return ContractAgreementSchema.parse(data);
};

export const validateBookingConfirmation = (data: unknown): BookingConfirmationRequest => {
  return BookingConfirmationSchema.parse(data);
};

export const validateCheckoutSession = (data: unknown): CheckoutSessionRequest => {
  return CheckoutSessionSchema.parse(data);
};

export const validateCartCheckout = (data: unknown): CartCheckoutRequest => {
  return CartCheckoutSchema.parse(data);
};
