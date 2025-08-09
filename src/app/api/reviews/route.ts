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
import { getFlags } from '@/lib/FeatureFlags';

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

// POST /api/reviews - Create a new review (AX Beta: text-only, post-completion reviews)
async function postHandler(req: NextRequest & { user: any }) {
  const { bookingId, targetId, text } = await req.json();

  if (!bookingId || !targetId || !text) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Check feature flags
    const flags = await getFlags();
    
    // Verify booking exists and is completed
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    if (!bookingDoc.exists()) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookingDoc.data();
    
    // AX Beta: Only allow reviews for completed bookings
    if (booking.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Reviews can only be created for completed bookings' 
      }, { status: 400 });
    }

    // AX Beta: No reviews for refunded or canceled bookings
    if (booking.status === 'refunded' || booking.status === 'canceled') {
      return NextResponse.json({ 
        error: 'Reviews cannot be created for refunded or canceled bookings' 
      }, { status: 400 });
    }

    // Verify user is authorized to review this booking (client or provider)
    if (req.user.uid !== booking.clientId && req.user.uid !== booking.providerId) {
      return NextResponse.json({ error: 'Unauthorized to review this booking' }, { status: 403 });
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

    // AX Beta: Text-only reviews with basic validation
    const reviewText = text.trim();
    if (reviewText.length < 10 || reviewText.length > 1000) {
      return NextResponse.json({ 
        error: 'Review text must be between 10 and 1000 characters' 
      }, { status: 400 });
    }

    // Create review data (AX Beta: no rating, text-only testimonials)
    const reviewData = {
      bookingId,
      authorId: req.user.uid,
      targetId,
      text: reviewText,
      type: flags.POSITIVE_REVIEWS_ONLY ? 'testimonial' : 'review',
      createdAt: Timestamp.now(),
      status: 'approved', // AX Beta: Auto-approve text-only reviews
      visible: true,
      isEditable: false, // AX Beta: Reviews cannot be edited after creation
      source: 'ax-beta', // Track that this is from the new system
      // Remove rating field - AX Beta is text-only
    };

    // Add the review
    const docRef = await addDoc(collection(db, 'reviews'), reviewData);
    
    return NextResponse.json({ 
      success: true, 
      reviewId: docRef.id,
      message: flags.POSITIVE_REVIEWS_ONLY ? 
        'Testimonial created successfully' : 
        'Review created successfully'
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export const POST = withAuth(postHandler);
