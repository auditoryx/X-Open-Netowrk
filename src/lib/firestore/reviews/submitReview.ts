import {
  getFirestore,
  doc,
  setDoc,
  collection,
  serverTimestamp,
  getDoc,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { logActivity } from '@/lib/firestore/logging/logActivity';

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
    authorId: review.clientId,
  };

  // Write to contract thread
  const contractReviewRef = doc(db, 'contracts', review.contractId, 'reviews', review.clientId);
  // Also write to user profile thread
  const userReviewRef = doc(db, 'users', review.providerId, 'reviews', review.clientId);

  const globalReviewsRef = collection(db, 'reviews');

  await Promise.all([
    setDoc(contractReviewRef, reviewData),
    setDoc(userReviewRef, reviewData),
    addDoc(globalReviewsRef, {
      ...reviewData,
      providerId: review.providerId,
      authorId: review.clientId,
    }),
    updateDoc(doc(db, 'bookings', review.bookingId), { hasReview: true }),
  ]);

  const ratingSnap = await getDocs(
    query(collection(db, 'reviews'), where('providerId', '==', review.providerId))
  );
  const ratings = ratingSnap.docs
    .map((d) => d.data().rating)
    .filter((r) => typeof r === 'number');
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  await updateDoc(doc(db, 'users', review.providerId), {
    averageRating: avg,
    reviewCount: ratings.length,
  });

  await notifyProvider(review.providerId, review.bookingId, review.rating);
  await logActivity(review.clientId, 'review_submitted', {
    bookingId: review.bookingId,
  });
}