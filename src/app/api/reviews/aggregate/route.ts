import { NextRequest, NextResponse } from 'next/server';
import { getAverageRating, getReviewCount, getRatingDistribution } from '@/lib/reviews';
import { getFlags } from '@/lib/featureFlags';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('targetId');

  if (!targetId) {
    return NextResponse.json({ error: 'targetId is required' }, { status: 400 });
  }

  try {
    const flags = await getFlags();

    if (flags.POSITIVE_REVIEWS_ONLY) {
      // New approach: positive reviews only with testimonials
      const positiveReviewCount = await getPositiveReviewCount(targetId);
      const latestTestimonials = await getLatestTestimonials(targetId, 5);

      return NextResponse.json({
        targetId,
        positiveReviewCount,
        testimonials: latestTestimonials,
        hasReviews: positiveReviewCount > 0,
        // Don't include rating data when positive reviews only is enabled
        mode: 'positive_only'
      });
    } else {
      // Legacy approach: include rating aggregation
      const [averageRating, reviewCount, ratingDistribution] = await Promise.all([
        getAverageRating(targetId),
        getReviewCount(targetId),
        getRatingDistribution(targetId)
      ]);

      return NextResponse.json({
        targetId,
        averageRating,
        reviewCount,
        ratingDistribution,
        hasReviews: reviewCount > 0,
        mode: 'legacy'
      });
    }
  } catch (error) {
    console.error('Error aggregating review data:', error);
    return NextResponse.json({ error: 'Failed to aggregate review data' }, { status: 500 });
  }
}

/**
 * Get count of positive (visible and approved) reviews
 */
async function getPositiveReviewCount(targetId: string): Promise<number> {
  const reviewsQuery = query(
    collection(db, 'reviews'),
    where('targetId', '==', targetId),
    where('visible', '==', true),
    where('status', '==', 'approved')
  );

  const snapshot = await getDocs(reviewsQuery);
  return snapshot.size;
}

/**
 * Get latest testimonials (text reviews) for display
 */
async function getLatestTestimonials(targetId: string, limitCount: number): Promise<any[]> {
  const reviewsQuery = query(
    collection(db, 'reviews'),
    where('targetId', '==', targetId),
    where('visible', '==', true),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(reviewsQuery);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      comment: data.comment,
      authorName: data.authorName || 'Anonymous',
      createdAt: data.createdAt,
      // Exclude rating from testimonials when in positive-only mode
    };
  });
}