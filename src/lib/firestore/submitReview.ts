import { getFirestore, doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

type Review = {
  bookingId: string;
  contractId: string;
  providerId: string;
  clientId: string;
  text: string;
  rating: number;
};

export async function submitReview(review: Review) {
  const db = getFirestore(app);

  const reviewData = {
    ...review,
    createdAt: serverTimestamp(),
  };

  // Write to contract thread
  const contractReviewRef = doc(db, 'contracts', review.contractId, 'reviews', review.clientId);
  // Also write to user profile thread
  const userReviewRef = doc(db, 'users', review.providerId, 'reviews', review.clientId);

  await Promise.all([
    setDoc(contractReviewRef, reviewData),
    setDoc(userReviewRef, reviewData)
  ]);
}
