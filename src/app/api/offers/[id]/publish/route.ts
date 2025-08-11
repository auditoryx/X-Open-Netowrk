import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, Timestamp, collection, query, where, getDocs, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import withAuth from '@/app/api/_utils/withAuth';
import offersConfig from '@/../config/offers.json';

// POST /api/offers/[id]/publish - Toggle offer active status
async function publishOfferHandler(req: NextRequest & { user: any }, { params }: { params: { id: string } }) {
  try {
    return await runTransaction(db, async (transaction) => {
      // Get existing offer within transaction
      const offerRef = doc(db, 'offers', params.id);
      const offerDoc = await transaction.get(offerRef);
      
      if (!offerDoc.exists()) {
        throw new Error('Offer not found');
      }

      const existingOffer = offerDoc.data();

      // Check ownership
      if (existingOffer.userId !== req.user.uid) {
        throw new Error('Unauthorized');
      }

      const newActiveStatus = !existingOffer.active;

      // If activating, check active offer limits within transaction
      if (newActiveStatus) {
        const userOffersQuery = query(
          collection(db, 'offers'),
          where(SCHEMA_FIELDS.NOTIFICATION.USER_ID, '==', req.user.uid),
          where('active', '==', true)
        );
        
        const userOffersSnapshot = await getDocs(userOffersQuery);
        const activeOfferCount = userOffersSnapshot.size;
        const maxActiveOffers = offersConfig.limits.maxActiveOffers;

        if (activeOfferCount >= maxActiveOffers) {
          throw new Error(`Maximum active offers limit reached (${maxActiveOffers}). Please deactivate another offer first.`);
        }
      }

      // Update the offer status within transaction
      transaction.update(offerRef, {
        active: newActiveStatus,
        status: newActiveStatus ? 'active' : 'paused',
        updatedAt: Timestamp.now(),
        ...(newActiveStatus && { publishedAt: Timestamp.now() })
      });

      return {
        success: true, 
        active: newActiveStatus,
        message: newActiveStatus ? 'Offer published successfully' : 'Offer unpublished successfully'
      };
    });

  } catch (error) {
    console.error('Error toggling offer status:', error);
    
    if (error.message === 'Offer not found') {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    if (error.message.includes('Maximum active offers limit reached')) {
      const maxActiveOffers = offersConfig.limits.maxActiveOffers;
      return NextResponse.json({ 
        error: error.message,
        maxActiveOffers,
        currentActiveOffers: maxActiveOffers
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to update offer status' }, { status: 500 });
  }
}

export const POST = withAuth(publishOfferHandler);