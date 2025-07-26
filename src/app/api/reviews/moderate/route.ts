import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import withAuth from '@/app/api/_utils/withAuth';

// POST /api/reviews/moderate - Moderate a review (admin only)
async function moderateHandler(req: NextRequest & { user: any }) {
  const { reviewId, action, reason } = await req.json();

  // Check if user is admin
  if (!req.user.customClaims?.admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  if (!reviewId || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const validActions = ['approve', 'reject', 'flag', 'unflag'];
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);

    if (!reviewDoc.exists()) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const updateData: any = {
      moderatedAt: Timestamp.now(),
      moderatedBy: req.user.uid,
      moderationAction: action
    };

    if (reason) {
      updateData.moderationReason = reason;
    }

    // Set status based on action
    switch (action) {
      case 'approve':
        updateData.status = 'approved';
        updateData.visible = true;
        break;
      case 'reject':
        updateData.status = 'rejected';
        updateData.visible = false;
        break;
      case 'flag':
        updateData.flagged = true;
        updateData.visible = false;
        break;
      case 'unflag':
        updateData.flagged = false;
        updateData.visible = true;
        break;
    }

    await updateDoc(reviewRef, updateData);

    return NextResponse.json({
      success: true,
      message: `Review ${action}ed successfully`,
      reviewId,
      action
    });
  } catch (error) {
    console.error('Error moderating review:', error);
    return NextResponse.json({ error: 'Failed to moderate review' }, { status: 500 });
  }
}

export const POST = withAuth(moderateHandler);