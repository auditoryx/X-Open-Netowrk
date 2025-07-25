import { 
  getFirestore, 
  doc, 
  setDoc, 
  Timestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

export interface VerificationData {
  uid: string;
  externalLinks: string[];
  verificationReason: string;
  submittedOn: Timestamp;
}

/**
 * Create or update a verification request in Firestore
 * @param userId - User ID
 * @param externalLinks - Array of external platform links
 * @param verificationReason - Reason for verification request
 * @returns Promise<void>
 */
export async function setVerification(
  userId: string,
  externalLinks: string[],
  verificationReason: string
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!verificationReason?.trim()) {
    throw new Error('Verification reason is required');
  }

  if (!externalLinks || externalLinks.length === 0) {
    throw new Error('At least one external link is required');
  }

  // Validate and filter external links
  const validLinks = externalLinks.filter(link => {
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

    const verificationData: VerificationData = {
      uid: userId,
      externalLinks: validLinks,
      verificationReason: verificationReason.trim(),
      submittedOn: Timestamp.now()
    };

    await setDoc(verificationDoc, verificationData, { merge: true });
  } catch (error) {
    console.error('Error setting verification:', error);
    throw new Error('Failed to submit verification request');
  }
}

/**
 * Award XP bonus to user upon verification approval
 * @param userId - User ID
 * @param xpAmount - Amount of XP to award (default: 500)
 * @returns Promise<void>
 */
export async function awardVerificationXP(
  userId: string,
  xpAmount: number = 500
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const db = getFirestore(app);
    const userDoc = doc(db, 'users', userId);

    await updateDoc(userDoc, {
      xp: increment(xpAmount),
      isVerified: true,
      verifiedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error awarding verification XP:', error);
    throw new Error('Failed to award verification XP');
  }
}