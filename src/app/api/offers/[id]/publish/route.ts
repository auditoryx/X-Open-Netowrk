import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import withAuth from '@/app/api/_utils/withAuth';
import offersConfig from '@/../config/offers.json';

// POST /api/offers/[id]/publish - Toggle offer active status
async function publishOfferHandler(req: NextRequest & { user: any }, { params }: { params: { id: string } }) {
  try {
    // Get existing offer
    const offerDoc = await getDoc(doc(db, 'offers', params.id));
    
    if (!offerDoc.exists()) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    const existingOffer = offerDoc.data();

    // Check ownership
    if (existingOffer.userId !== req.user.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const newActiveStatus = !existingOffer.active;

    // If activating, check active offer limits
    if (newActiveStatus) {
      const userOffersQuery = query(
        collection(db, 'offers'),
        where('userId', '==', req.user.uid),
        where('active', '==', true)
      );
      
      const userOffersSnapshot = await getDocs(userOffersQuery);
      const activeOfferCount = userOffersSnapshot.size;
      const maxActiveOffers = offersConfig.limits.maxActiveOffers;

      if (activeOfferCount >= maxActiveOffers) {
        return NextResponse.json({ 
          error: `Maximum active offers limit reached (${maxActiveOffers}). Please deactivate another offer first.`,
          maxActiveOffers,
          currentActiveOffers: activeOfferCount
        }, { status: 400 });
      }
    }

    // Update the offer status
    await updateDoc(doc(db, 'offers', params.id), {
      active: newActiveStatus,
      status: newActiveStatus ? 'active' : 'paused',
      updatedAt: Timestamp.now(),
      ...(newActiveStatus && { publishedAt: Timestamp.now() })
    });

    return NextResponse.json({ 
      success: true, 
      active: newActiveStatus,
      message: newActiveStatus ? 'Offer published successfully' : 'Offer unpublished successfully'
    });

  } catch (error) {
    console.error('Error toggling offer status:', error);
    return NextResponse.json({ error: 'Failed to update offer status' }, { status: 500 });
  }
}

export const POST = withAuth(publishOfferHandler);