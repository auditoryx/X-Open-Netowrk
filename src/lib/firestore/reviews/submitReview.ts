import { getFirestore, doc, setDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

async function notifyProvider(providerId: string, bookingId: string, rating: number) {
  const db = getFirestore(app)
  const snap = await getDoc(doc(db, 'users', providerId))
  const email = snap.exists() ? (snap.data() as any).email || null : null
  await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: providerId,
      email,
      type: 'review',
      title: 'New Review Received',
      message: `You received a ${rating}-star review from a client`,
      link: `/dashboard/bookings/${bookingId}`
    })
  })
}

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

  await notifyProvider(review.providerId, review.bookingId, review.rating);
}