import { NextRequest, NextResponse } from 'next/server';
import { 
  collection, 
  doc,
  addDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDoc,
  Timestamp,
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import withAuth from '@/app/api/_utils/withAuth';
import { z } from 'zod';
import { OfferRole, Currency, BaseOffer } from '@/types/offer';
import offersConfig from '@/../config/offers.json';

// Validation schemas
const CreateOfferSchema = z.object({
  role: z.enum(['artist', 'producer', 'engineer', 'videographer', 'studio']),
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  price: z.number().min(0),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD']),
  turnaroundDays: z.number().int().min(1),
  revisions: z.number().int().min(0),
  deliverables: z.array(z.string()).min(1),
  addons: z.array(z.object({
    name: z.string(),
    price: z.number().min(0),
    description: z.string().optional(),
    required: z.boolean().optional()
  })).optional().default([]),
  usagePolicy: z.string().optional(),
  media: z.array(z.string().url()).max(10).optional().default([]),
  templateId: z.string().optional(),
  isCustom: z.boolean().optional().default(false),
  // Role-specific fields are validated separately
  roleSpecific: z.record(z.any()).optional().default({})
});

const UpdateOfferSchema = CreateOfferSchema.partial().omit(['role']);

// GET /api/offers - List offers with filtering
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');
  const active = searchParams.get('active');
  const limitParam = searchParams.get('limit');
  const after = searchParams.get('after');

  try {
    let q = collection(db, 'offers');
    const constraints = [];

    // Apply filters
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    if (role) {
      constraints.push(where('role', '==', role));
    }
    
    if (active !== null) {
      constraints.push(where('active', '==', active === 'true'));
    }

    // Default ordering
    constraints.push(orderBy('createdAt', 'desc'));
    
    // Pagination
    if (limitParam) {
      constraints.push(limit(parseInt(limitParam, 10)));
    }

    if (after) {
      const afterDoc = await getDoc(doc(db, 'offers', after));
      if (afterDoc.exists()) {
        constraints.push(startAfter(afterDoc));
      }
    }

    const offersQuery = query(q, ...constraints);
    const snapshot = await getDocs(offersQuery);
    
    const offers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      offers,
      hasMore: snapshot.docs.length === parseInt(limitParam || '20', 10),
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
      total: offers.length
    });

  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

// POST /api/offers - Create a new offer
async function createOfferHandler(req: NextRequest & { user: any }) {
  try {
    const body = await req.json();
    const validatedData = CreateOfferSchema.parse(body);

    // Check user's active offer count against config limits
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
        error: `Maximum active offers limit reached (${maxActiveOffers})` 
      }, { status: 400 });
    }

    // Validate role-specific fields based on offer role
    const roleValidationResult = validateRoleSpecificFields(validatedData.role, validatedData.roleSpecific);
    if (!roleValidationResult.valid) {
      return NextResponse.json({ 
        error: `Role validation failed: ${roleValidationResult.error}` 
      }, { status: 400 });
    }

    // Create offer data
    const now = Timestamp.now();
    const offerData = {
      userId: req.user.uid,
      role: validatedData.role,
      title: validatedData.title,
      description: validatedData.description,
      price: validatedData.price,
      currency: validatedData.currency,
      turnaroundDays: validatedData.turnaroundDays,
      revisions: validatedData.revisions,
      deliverables: validatedData.deliverables,
      addons: validatedData.addons,
      usagePolicy: validatedData.usagePolicy,
      media: validatedData.media,
      active: false, // New offers start as inactive
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      views: 0,
      bookings: 0,
      completedBookings: 0,
      templateId: validatedData.templateId,
      isCustom: validatedData.isCustom,
      // Merge role-specific fields into the main document
      ...validatedData.roleSpecific
    };

    // Add the offer
    const docRef = await addDoc(collection(db, 'offers'), offerData);

    return NextResponse.json({ 
      success: true, 
      offerId: docRef.id,
      message: 'Offer created successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error creating offer:', error);
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}

export const POST = withAuth(createOfferHandler);

// Helper function to validate role-specific fields
function validateRoleSpecificFields(role: OfferRole, roleSpecific: Record<string, any>): { valid: boolean; error?: string } {
  switch (role) {
    case 'producer':
      // Validate producer-specific fields
      if (roleSpecific.licenseOptions && !Array.isArray(roleSpecific.licenseOptions)) {
        return { valid: false, error: 'licenseOptions must be an array' };
      }
      if (roleSpecific.bpm && (typeof roleSpecific.bpm !== 'number' || roleSpecific.bpm < 60 || roleSpecific.bpm > 200)) {
        return { valid: false, error: 'bpm must be a number between 60 and 200' };
      }
      break;
      
    case 'engineer':
      if (roleSpecific.service && !['Mix', 'Master', 'Tuning', 'Bundle', 'Atmos'].includes(roleSpecific.service)) {
        return { valid: false, error: 'Invalid engineer service type' };
      }
      if (roleSpecific.stemTier && !['Basic', 'Standard', 'Large'].includes(roleSpecific.stemTier)) {
        return { valid: false, error: 'Invalid stem tier' };
      }
      break;
      
    case 'videographer':
      if (roleSpecific.category && !['Promo', 'Performance', 'Event', 'EditingOnly', 'Lyric'].includes(roleSpecific.category)) {
        return { valid: false, error: 'Invalid videographer category' };
      }
      if (roleSpecific.locations && (typeof roleSpecific.locations !== 'number' || roleSpecific.locations < 1)) {
        return { valid: false, error: 'locations must be a positive number' };
      }
      break;
      
    case 'studio':
      if (roleSpecific.hourlyRate && (typeof roleSpecific.hourlyRate !== 'number' || roleSpecific.hourlyRate < 0)) {
        return { valid: false, error: 'hourlyRate must be a positive number' };
      }
      if (roleSpecific.depositPct && (typeof roleSpecific.depositPct !== 'number' || roleSpecific.depositPct < 0 || roleSpecific.depositPct > 100)) {
        return { valid: false, error: 'depositPct must be between 0 and 100' };
      }
      break;
      
    case 'artist':
      if (roleSpecific.featureType && !['Vocals', 'Rap', 'Songwriting', 'Topline', 'Full Song'].includes(roleSpecific.featureType)) {
        return { valid: false, error: 'Invalid artist feature type' };
      }
      if (roleSpecific.publishingShare && (typeof roleSpecific.publishingShare !== 'number' || roleSpecific.publishingShare < 0 || roleSpecific.publishingShare > 100)) {
        return { valid: false, error: 'publishingShare must be between 0 and 100' };
      }
      break;
  }
  
  return { valid: true };
}