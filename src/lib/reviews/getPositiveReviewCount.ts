import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Get count of positive reviews for a target (user/service)
 * In the credibility system, all visible and approved reviews are considered positive
 */
export async function getPositiveReviewCount(targetId: string): Promise<number> {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('targetId', '==', targetId),
      where('visible', '==', true),
      where('status', '==', 'approved')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting positive review count:', error);
    return 0;
  }
}