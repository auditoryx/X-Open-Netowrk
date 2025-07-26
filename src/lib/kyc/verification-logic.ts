/**
 * Verification Logic Service
 * 
 * Manages the verification state machine and business logic
 * for user verification workflows.
 */

import { z } from 'zod';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserVerification, UserVerificationSchema } from './stripe-identity';

// Verification state transitions
export const VerificationStates = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending', 
  PROCESSING: 'processing',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  CANCELED: 'canceled',
} as const;

export type VerificationState = typeof VerificationStates[keyof typeof VerificationStates];

// Admin review schema
export const AdminReviewSchema = z.object({
  reviewerId: z.string(),
  reviewerName: z.string(),
  action: z.enum(['approve', 'reject', 'request_additional']),
  reason: z.string().optional(),
  notes: z.string().optional(),
  reviewedAt: z.date().default(() => new Date()),
});

export type AdminReview = z.infer<typeof AdminReviewSchema>;

// Complete verification record
export const VerificationRecordSchema = UserVerificationSchema.extend({
  adminReview: AdminReviewSchema.optional(),
  retryCount: z.number().default(0),
  lastRetryAt: z.date().optional(),
  automaticApproval: z.boolean().default(false),
});

export type VerificationRecord = z.infer<typeof VerificationRecordSchema>;

/**
 * Create a new verification record
 */
export async function createVerificationRecord(
  userId: string,
  sessionId: string,
  status: VerificationState = VerificationStates.PENDING
): Promise<void> {
  const verificationRef = doc(db, 'users', userId, 'verification', sessionId);
  
  const record: Partial<VerificationRecord> = {
    userId,
    sessionId,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
    retryCount: 0,
    automaticApproval: false,
  };

  await setDoc(verificationRef, {
    ...record,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update user's verification status
  await updateUserVerificationStatus(userId, status);
}

/**
 * Update verification record status
 */
export async function updateVerificationRecord(
  userId: string,
  sessionId: string,
  updates: Partial<VerificationRecord>
): Promise<void> {
  const verificationRef = doc(db, 'users', userId, 'verification', sessionId);
  
  await updateDoc(verificationRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  // Update user's main verification status if status changed
  if (updates.status) {
    await updateUserVerificationStatus(userId, updates.status);
  }
}

/**
 * Get verification record
 */
export async function getVerificationRecord(
  userId: string,
  sessionId: string
): Promise<VerificationRecord | null> {
  const verificationRef = doc(db, 'users', userId, 'verification', sessionId);
  const verificationSnap = await getDoc(verificationRef);
  
  if (!verificationSnap.exists()) {
    return null;
  }

  const data = verificationSnap.data();
  return VerificationRecordSchema.parse({
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    verifiedAt: data.verifiedAt?.toDate(),
    rejectedAt: data.rejectedAt?.toDate(),
    lastRetryAt: data.lastRetryAt?.toDate(),
    adminReview: data.adminReview ? {
      ...data.adminReview,
      reviewedAt: data.adminReview.reviewedAt?.toDate(),
    } : undefined,
  });
}

/**
 * Get latest verification record for user
 */
export async function getLatestVerificationRecord(
  userId: string
): Promise<VerificationRecord | null> {
  const verificationsRef = collection(db, 'users', userId, 'verification');
  const q = query(verificationsRef);
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  // Get the most recent verification
  let latestRecord: VerificationRecord | null = null;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const record = VerificationRecordSchema.parse({
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      verifiedAt: data.verifiedAt?.toDate(),
      rejectedAt: data.rejectedAt?.toDate(),
      lastRetryAt: data.lastRetryAt?.toDate(),
      adminReview: data.adminReview ? {
        ...data.adminReview,
        reviewedAt: data.adminReview.reviewedAt?.toDate(),
      } : undefined,
    });

    if (!latestRecord || record.createdAt > latestRecord.createdAt) {
      latestRecord = record;
    }
  });

  return latestRecord;
}

/**
 * Update user's main verification status
 */
export async function updateUserVerificationStatus(
  userId: string,
  status: VerificationState
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    verificationStatus: status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get user's current verification status
 */
export async function getUserVerificationStatus(
  userId: string
): Promise<VerificationState> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return VerificationStates.UNVERIFIED;
  }

  return userSnap.data()?.verificationStatus || VerificationStates.UNVERIFIED;
}

/**
 * Add admin review to verification record
 */
export async function addAdminReview(
  userId: string,
  sessionId: string,
  review: AdminReview
): Promise<void> {
  const verificationRef = doc(db, 'users', userId, 'verification', sessionId);
  
  let newStatus: VerificationState;
  switch (review.action) {
    case 'approve':
      newStatus = VerificationStates.VERIFIED;
      break;
    case 'reject':
      newStatus = VerificationStates.REJECTED;
      break;
    case 'request_additional':
      newStatus = VerificationStates.PENDING;
      break;
    default:
      newStatus = VerificationStates.PENDING;
  }

  await updateDoc(verificationRef, {
    adminReview: {
      ...review,
      reviewedAt: serverTimestamp(),
    },
    status: newStatus,
    verifiedAt: review.action === 'approve' ? serverTimestamp() : null,
    rejectedAt: review.action === 'reject' ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });

  // Update user's main verification status
  await updateUserVerificationStatus(userId, newStatus);
}

/**
 * Get pending verifications for admin review
 */
export async function getPendingVerifications(limit = 20): Promise<VerificationRecord[]> {
  // This would typically query across all users, but Firestore doesn't support
  // cross-collection queries easily. We'd need a dedicated 'verifications' collection
  // or use Cloud Functions to maintain a global index.
  
  // For now, return empty array - this should be implemented with proper indexing
  console.warn('getPendingVerifications requires global verification index');
  return [];
}

/**
 * Check if user can retry verification
 */
export async function canRetryVerification(userId: string): Promise<{
  canRetry: boolean;
  reason?: string;
  cooldownUntil?: Date;
}> {
  const latestRecord = await getLatestVerificationRecord(userId);
  
  if (!latestRecord) {
    return { canRetry: true };
  }

  // Check retry limits
  const maxRetries = 3;
  if (latestRecord.retryCount >= maxRetries) {
    return {
      canRetry: false,
      reason: 'Maximum retry attempts exceeded. Please contact support.',
    };
  }

  // Check cooldown period (24 hours)
  const cooldownHours = 24;
  const cooldownMs = cooldownHours * 60 * 60 * 1000;
  
  if (latestRecord.lastRetryAt) {
    const cooldownUntil = new Date(latestRecord.lastRetryAt.getTime() + cooldownMs);
    if (new Date() < cooldownUntil) {
      return {
        canRetry: false,
        reason: 'Please wait before retrying verification.',
        cooldownUntil,
      };
    }
  }

  return { canRetry: true };
}

/**
 * Increment retry count for user
 */
export async function incrementRetryCount(
  userId: string,
  sessionId: string
): Promise<void> {
  const verificationRef = doc(db, 'users', userId, 'verification', sessionId);
  const record = await getVerificationRecord(userId, sessionId);
  
  if (record) {
    await updateDoc(verificationRef, {
      retryCount: (record.retryCount || 0) + 1,
      lastRetryAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Check if verification is required for user action
 */
export function isVerificationRequired(
  action: string,
  userTier: string,
  verificationStatus: VerificationState
): boolean {
  const requiresVerification = [
    'tier_upgrade_verified',
    'tier_upgrade_signature',
    'withdraw_funds',
    'create_service_verified',
    'create_service_signature',
  ];

  if (!requiresVerification.includes(action)) {
    return false;
  }

  // Signature tier always requires verification
  if (action.includes('signature') && verificationStatus !== VerificationStates.VERIFIED) {
    return true;
  }

  // Verified tier requires verification
  if (action.includes('verified') && verificationStatus !== VerificationStates.VERIFIED) {
    return true;
  }

  return false;
}

export default {
  VerificationStates,
  createVerificationRecord,
  updateVerificationRecord,
  getVerificationRecord,
  getLatestVerificationRecord,
  updateUserVerificationStatus,
  getUserVerificationStatus,
  addAdminReview,
  getPendingVerifications,
  canRetryVerification,
  incrementRetryCount,
  isVerificationRequired,
};