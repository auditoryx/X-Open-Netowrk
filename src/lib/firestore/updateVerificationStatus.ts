import { 
  getFirestore, 
  doc, 
  updateDoc, 
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { VerificationRequest } from './submitVerificationRequest';

/**
 * Update verification request status
 * @param userId - User ID
 * @param status - New status
 * @param reviewedBy - Admin who reviewed the request
 * @param reviewNotes - Optional review notes
 * @returns Promise<void>
 */
export async function updateVerificationStatus(
  userId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  reviewNotes?: string
): Promise<void> {
  if (!userId || !status || !reviewedBy) {
    throw new Error('Missing required parameters');
  }

  try {
    const db = getFirestore(app);
    const verificationDoc = doc(db, 'verifications', userId);

    const updateData: Partial<VerificationRequest> = {
      status,
      updatedAt: Timestamp.now(),
      reviewedBy,
    };

    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes;
    }

    await updateDoc(verificationDoc, updateData);
  } catch (error) {
    console.error('Error updating verification status:', error);
    throw new Error('Failed to update verification status');
  }
}

/**
 * Get all pending verification requests
 * @returns Promise<VerificationRequest[]>
 */
export async function getAllPendingVerifications(): Promise<VerificationRequest[]> {
  try {
    const db = getFirestore(app);
    const verificationsRef = collection(db, 'verifications');
    const q = query(
      verificationsRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VerificationRequest[];
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    throw new Error('Failed to fetch pending verifications');
  }
}

/**
 * Get all verification requests with optional status filter
 * @param status - Optional status filter
 * @returns Promise<VerificationRequest[]>
 */
export async function getAllVerifications(
  status?: 'pending' | 'approved' | 'rejected'
): Promise<VerificationRequest[]> {
  try {
    const db = getFirestore(app);
    const verificationsRef = collection(db, 'verifications');
    
    let q;
    if (status) {
      q = query(
        verificationsRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        verificationsRef,
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VerificationRequest[];
  } catch (error) {
    console.error('Error fetching verifications:', error);
    throw new Error('Failed to fetch verifications');
  }
}

/**
 * Update user profile verification status
 * @param userId - User ID
 * @param isVerified - Verification status
 * @returns Promise<void>
 */
export async function updateUserVerificationStatus(
  userId: string,
  isVerified: boolean
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const db = getFirestore(app);
    const userDoc = doc(db, 'users', userId);

    await updateDoc(userDoc, {
      isVerified,
      verifiedAt: isVerified ? Timestamp.now() : null,
      proTier: isVerified ? 'verified' : null
    });
  } catch (error) {
    console.error('Error updating user verification status:', error);
    throw new Error('Failed to update user verification status');
  }
}

/**
 * Approve verification request (updates both verification and user profile)
 * @param userId - User ID
 * @param reviewedBy - Admin who approved the request
 * @param reviewNotes - Optional review notes
 * @returns Promise<void>
 */
export async function approveVerification(
  userId: string,
  reviewedBy: string,
  reviewNotes?: string
): Promise<void> {
  try {
    // Update verification status and user profile in sequence
    await updateVerificationStatus(userId, 'approved', reviewedBy, reviewNotes);
    await updateUserVerificationStatus(userId, true);
  } catch (error) {
    console.error('Error approving verification:', error);
    throw new Error('Failed to approve verification');
  }
}

/**
 * Reject verification request
 * @param userId - User ID
 * @param reviewedBy - Admin who rejected the request
 * @param reviewNotes - Review notes explaining rejection
 * @returns Promise<void>
 */
export async function rejectVerification(
  userId: string,
  reviewedBy: string,
  reviewNotes: string
): Promise<void> {
  try {
    await updateVerificationStatus(userId, 'rejected', reviewedBy, reviewNotes);
  } catch (error) {
    console.error('Error rejecting verification:', error);
    throw new Error('Failed to reject verification');
  }
}
