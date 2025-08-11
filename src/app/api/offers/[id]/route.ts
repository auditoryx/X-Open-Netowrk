import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import withAuth from '@/app/api/_utils/withAuth';
import { z } from 'zod';
import offersConfig from '@/../config/offers.json';

const UpdateOfferSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(20).max(2000).optional(),
  price: z.number().min(0).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD']).optional(),
  turnaroundDays: z.number().int().min(1).optional(),
  revisions: z.number().int().min(0).optional(),
  deliverables: z.array(z.string()).min(1).optional(),
  addons: z.array(z.object({
    name: z.string(),
    price: z.number().min(0),
    description: z.string().optional(),
    required: z.boolean().optional()
  })).optional(),
  usagePolicy: z.string().optional(),
  media: z.array(z.string().url()).max(10).optional(),
  active: z.boolean().optional(),
  roleSpecific: z.record(z.any()).optional()
});

// GET /api/offers/[id] - Get specific offer
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const offerDoc = await getDoc(doc(db, 'offers', params.id));
    
    if (!offerDoc.exists()) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    const offer = {
      id: offerDoc.id,
      ...offerDoc.data()
    };

    return NextResponse.json({ offer });

  } catch (error) {
    console.error('Error fetching offer:', error);
    return NextResponse.json({ error: 'Failed to fetch offer' }, { status: 500 });
  }
}

// PATCH /api/offers/[id] - Update offer
async function updateOfferHandler(req: NextRequest & { user: any }, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validatedData = UpdateOfferSchema.parse(body);

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

    // If activating offer, check active offer limits
    if (validatedData.active === true && !existingOffer.active) {
      const userOffersQuery = query(
        collection(db, 'offers'),
        where(SCHEMA_FIELDS.NOTIFICATION.USER_ID, '==', req.user.uid),
        where('active', '==', true)
      );
      
      const userOffersSnapshot = await getDocs(userOffersQuery);
      const activeOfferCount = userOffersSnapshot.size;
      const maxActiveOffers = offersConfig.limits.maxActiveOffers;

      if (activeOfferCount >= maxActiveOffers) {
        return NextResponse.json({ 
          error: `Maximum active offers limit reached (${maxActiveOffers})` 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: Timestamp.now()
    };

    // Only include fields that are being updated
    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'roleSpecific') {
          // Merge role-specific fields into the main document
          Object.assign(updateData, value);
        } else {
          updateData[key] = value;
        }
      }
    });

    // Update the offer
    await updateDoc(doc(db, 'offers', params.id), updateData);

    return NextResponse.json({ 
      success: true, 
      message: 'Offer updated successfully' 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error updating offer:', error);
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}

// DELETE /api/offers/[id] - Delete offer
async function deleteOfferHandler(req: NextRequest & { user: any }, { params }: { params: { id: string } }) {
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

    // Check if offer has any bookings
    if (existingOffer.bookings && existingOffer.bookings > 0) {
      // Soft delete by deactivating instead of hard delete
      await updateDoc(doc(db, 'offers', params.id), {
        active: false,
        status: 'deleted',
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Offer deactivated (has existing bookings)' 
      });
    } else {
      // Hard delete if no bookings
      await deleteDoc(doc(db, 'offers', params.id));

      return NextResponse.json({ 
        success: true, 
        message: 'Offer deleted successfully' 
      });
    }

  } catch (error) {
    console.error('Error deleting offer:', error);
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}

export const PATCH = withAuth(updateOfferHandler);
export const DELETE = withAuth(deleteOfferHandler);