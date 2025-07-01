import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PostReviewParams {
  bookingId: string;
  providerUid: string;
  clientUid: string;
  rating: number;
  comment: string;
  serviceTitle: string;
}

export async function postReview({
  bookingId,
  providerUid,
  clientUid,
  rating,
  comment,
  serviceTitle
}: PostReviewParams): Promise<void> {
  // Validate inputs
  if (!bookingId || !providerUid || !clientUid) {
    throw new Error('Missing required parameters');
  }
  
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  if (!comment.trim()) {
    throw new Error('Comment is required');
  }

  // Use bookingId as the document ID to ensure one review per booking
  const reviewRef = doc(db, 'reviews', bookingId);
  
  // Check if review already exists
  const existingReview = await getDoc(reviewRef);
  if (existingReview.exists()) {
    throw new Error('A review has already been submitted for this booking');
  }

  // Create the review document
  const reviewData = {
    bookingId,
    providerUid,
    clientUid,
    providerId: providerUid, // For compatibility with existing queries
    rating,
    comment: comment.trim(),
    serviceTitle,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(reviewRef, reviewData);
  } catch (error) {
    console.error('Error posting review:', error);
    throw new Error('Failed to submit review. Please try again.');
  }
}

export default postReview;
