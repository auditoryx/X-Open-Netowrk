import { db } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import withAuth from '@/app/api/_utils/withAuth';
import { validateReview } from '@/lib/schema';

async function handler(req: NextRequest & { user: any }) {
  const { bookingId, targetId, text, rating } = await req.json();

  if (!bookingId || !targetId || !text || !rating) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Validate review data
  const reviewData = {
    bookingId,
    authorId: req.user.uid, // Updated from reviewerId
    targetId, // Updated from reviewedId
    text,
    rating,
    createdAt: Timestamp.now(),
  };

  try {
    // Validate using schema
    validateReview(reviewData);
    
    await addDoc(collection(db, 'reviews'), reviewData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
