import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp 
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

export interface VerificationRequest {
  userId: string;
  name: string;
  role: string;
  statement: string;
  links: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  reviewedBy?: string;
  reviewNotes?: string;
  // New fields from enhanced flow
  externalLinks?: string[];
  verificationReason?: string;
  submittedOn?: Timestamp;
  uid?: string;
}

export interface VerificationFormData {
  statement: string;
  links: string[];
}

/**
 * Submit a verification request for a user
 * @param userId - User ID
 * @param userData - User profile data (name, role)
 * @param formData - Verification form data
 * @returns Promise<void>
 */
export async function submitVerificationRequest(
  userId: string, 
  userData: { name: string; role: string }, 
  formData: VerificationFormData
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!formData.statement?.trim()) {
    throw new Error('Statement is required');
  }

  if (!formData.links || formData.links.length === 0) {
    throw new Error('At least one link is required');
  }

  // Validate links
  const validLinks = formData.links.filter(link => {
    if (!link?.trim()) return false;
    try {
      new URL(link);
      return true;
    } catch {
      return false;
    }
  });

  if (validLinks.length === 0) {
    throw new Error('At least one valid URL is required');
  }

  try {
    const db = getFirestore(app);
    const verificationDoc = doc(db, 'verifications', userId);

    const verificationRequest: VerificationRequest = {
      userId,
      name: userData.name || 'Unknown',
      role: userData.role || 'Unknown',
      statement: formData.statement.trim(),
      links: validLinks,
      status: 'pending',
      createdAt: Timestamp.now()
    };

    await setDoc(verificationDoc, verificationRequest);
  } catch (error) {
    console.error('Error submitting verification request:', error);
    throw new Error('Failed to submit verification request');
  }
}

/**
 * Get verification status for a user
 * @param userId - User ID
 * @returns Promise<VerificationRequest | null>
 */
export async function getVerificationStatus(userId: string): Promise<VerificationRequest | null> {
  if (!userId) return null;

  try {
    const db = getFirestore(app);
    const verificationDoc = doc(db, 'verifications', userId);
    const snap = await getDoc(verificationDoc);

    if (snap.exists()) {
      return snap.data() as VerificationRequest;
    }

    return null;
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return null;
  }
}

/**
 * Check if user can apply for verification
 * @param userId - User ID
 * @returns Promise<{ canApply: boolean; reason?: string; status?: string }>
 */
export async function canApplyForVerification(userId: string): Promise<{
  canApply: boolean;
  reason?: string;
  status?: string;
}> {
  if (!userId) {
    return { canApply: false, reason: 'User not authenticated' };
  }

  try {
    const verification = await getVerificationStatus(userId);

    if (!verification) {
      return { canApply: true };
    }

    switch (verification.status) {
      case 'pending':
        return { 
          canApply: false, 
          reason: 'You already have a pending verification request',
          status: 'pending'
        };
      case 'approved':
        return { 
          canApply: false, 
          reason: 'You are already verified',
          status: 'approved'
        };
      case 'rejected':
        // Allow reapplication after rejection, but note previous rejection
        return { 
          canApply: true, 
          reason: 'Previous application was rejected. You can apply again.',
          status: 'rejected'
        };
      default:
        return { canApply: true };
    }
  } catch (error) {
    console.error('Error checking verification eligibility:', error);
    return { canApply: false, reason: 'Error checking verification status' };
  }
}
