import { NextRequest, NextResponse } from 'next/server';
import { getAverageRating, getReviewCount, getRatingDistribution } from '@/lib/reviews';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('targetId');

  if (!targetId) {
    return NextResponse.json({ error: 'targetId is required' }, { status: 400 });
  }

  try {
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
      hasReviews: reviewCount > 0
    });
  } catch (error) {
    console.error('Error aggregating review data:', error);
    return NextResponse.json({ error: 'Failed to aggregate review data' }, { status: 500 });
  }
}