import { db } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';
import { 
  collection, 
  addDoc, 
  Timestamp, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  startAfter,
  getDoc,
  doc
} from 'firebase/firestore';
import withAuth from '@/app/api/_utils/withAuth';
import { validateReview } from '@/lib/schema';
import { moderateReview } from '@/lib/reviews/moderation';

// GET /api/reviews - Fetch reviews with optional filtering
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('targetId');
  const authorId = searchParams.get('authorId');
  const bookingId = searchParams.get('bookingId');
  const limitParam = searchParams.get('limit');
  const after = searchParams.get('after');

  try {
    let q = collection(db, 'reviews');

    // Build query with filters
    const constraints = [];
    
    if (targetId) {
      constraints.push(where('targetId', '==', targetId));
    }
    
    if (authorId) {
      constraints.push(where('authorId', '==', authorId));
    }
    
    if (bookingId) {
      constraints.push(where('bookingId', '==', bookingId));
    }

    // Only show visible reviews by default
    constraints.push(where('visible', '==', true));

    // Add ordering and pagination
    constraints.push(orderBy('createdAt', 'desc'));
    
    if (limitParam) {
      constraints.push(limit(parseInt(limitParam, 10)));
    }

    if (after) {
      // Get the document to start after
      const afterDoc = await getDoc(doc(db, 'reviews', after));
      if (afterDoc.exists()) {
        constraints.push(startAfter(afterDoc));
      }
    }

    const reviewsQuery = query(q, ...constraints);
    const snapshot = await getDocs(reviewsQuery);
    
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      reviews,
      hasMore: snapshot.docs.length === parseInt(limitParam || '20', 10),
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/reviews - Create a new review
async function postHandler(req: NextRequest & { user: any }) {
  const { bookingId, targetId, text, rating } = await req.json();

  if (!bookingId || !targetId || !text || !rating) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check if review already exists for this booking
  const existingQuery = query(
    collection(db, 'reviews'),
    where('bookingId', '==', bookingId),
    where('authorId', '==', req.user.uid)
  );
  
  const existingSnapshot = await getDocs(existingQuery);
  if (!existingSnapshot.empty) {
    return NextResponse.json({ error: 'Review already exists for this booking' }, { status: 409 });
  }

  // Validate review data
  const reviewData = {
    bookingId,
    authorId: req.user.uid,
    targetId,
    text: text.trim(),
    rating: parsedRating,
    createdAt: Timestamp.now(),
  };

  try {
    // Validate using schema
    validateReview(reviewData);
    
    // Ensure rating is within valid range
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Run automatic moderation
    const moderationResult = moderateReview({
      rating: reviewData.rating,
      text: reviewData.text,
      authorId: reviewData.authorId
    });

    // Add moderation data to review
    const enhancedReviewData = {
      ...reviewData,
      moderation: {
        isAppropriate: moderationResult.isAppropriate,
        confidence: moderationResult.confidence,
        flags: moderationResult.flags,
        autoModerated: true,
        moderatedAt: Timestamp.now()
      },
      // Auto-approve if moderation confidence is high
      status: moderationResult.isAppropriate && moderationResult.confidence > CONFIDENCE_THRESHOLD ? 'approved' : 'pending',
      visible: moderationResult.isAppropriate && moderationResult.confidence > CONFIDENCE_THRESHOLD
    };

    // Add the review
    const docRef = await addDoc(collection(db, 'reviews'), enhancedReviewData);
    
    const response: any = { 
      success: true, 
      reviewId: docRef.id,
      message: 'Review submitted successfully'
    };

    // Include moderation feedback if review needs attention
    if (!moderationResult.isAppropriate || moderationResult.confidence <= 0.8) {
      response.moderation = {
        status: 'pending_review',
        message: 'Your review is being reviewed by our moderation team',
        suggestions: moderationResult.suggestions
      };
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: 'Invalid review data' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export const POST = withAuth(postHandler);
