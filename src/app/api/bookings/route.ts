import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, doc, getDocs, updateDoc, addDoc, getDoc, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { getServerUser } from '@/lib/auth/getServerUser';
import { z } from 'zod';

const db = getFirestore(app);

// Validation schema for booking creation
const CreateBookingSchema = z.object({
  providerId: z.string(),
  serviceId: z.string().optional(),
  offerId: z.string().optional(),
  serviceName: z.string().min(1),
  datetime: z.string(),
  notes: z.string().optional(),
  amount: z.number().positive().optional(),
  selectedAddons: z.array(z.object({
    name: z.string(),
    price: z.number()
  })).optional().default([])
});

// GET bookings (auth-protected)
async function getBookings(req: NextRequest) {
  const user = await getServerUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await getDocs(collection(db, 'bookings'));
  const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json(bookings);
}

// POST create booking (auth-protected) with offer tamper-proofing
async function createBooking(req: NextRequest) {
  const user = await getServerUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validatedData = CreateBookingSchema.parse(body);

    let offerSnapshot = null;

    // If booking is from an offer, look up offer server-side and snapshot data
    if (validatedData.offerId) {
      const offerRef = doc(db, 'offers', validatedData.offerId);
      const offerDoc = await getDoc(offerRef);
      
      if (!offerDoc.exists()) {
        return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
      }

      const offerData = offerDoc.data();
      
      // Verify offer is active
      if (!offerData.active) {
        return NextResponse.json({ error: 'Offer is not active' }, { status: 400 });
      }

      // Create tamper-proof snapshot - ignore any client-provided fields
      const totalAddonPrice = validatedData.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
      
      offerSnapshot = {
        title: offerData.title,
        price: offerData.price,
        currency: offerData.currency,
        turnaroundDays: offerData.turnaroundDays,
        revisions: offerData.revisions,
        deliverables: offerData.deliverables,
        selectedAddons: validatedData.selectedAddons || [],
        totalPrice: offerData.price + totalAddonPrice,
        role: offerData.role
      };

      // Override service name with offer title for consistency
      validatedData.serviceName = offerData.title;
    }

    // Create booking data
    const now = Timestamp.now();
    const bookingData = {
      clientId: user.uid,
      providerId: validatedData.providerId,
      serviceId: validatedData.serviceId,
      serviceName: validatedData.serviceName,
      datetime: validatedData.datetime,
      notes: validatedData.notes,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      
      // Offer integration
      offerId: validatedData.offerId || null,
      offerSnapshot,
      
      // Contract setup
      contract: {
        terms: '',
        agreedByClient: false,
        agreedByProvider: false
      },
      
      // Payment and completion tracking
      isPaid: false,
      creditAwarded: false,
      processed: false, // For idempotency in completion processing
    };

    // Create the booking
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);

    return NextResponse.json({ 
      success: true, 
      bookingId: docRef.id,
      message: 'Booking created successfully',
      offerSnapshot: offerSnapshot ? 'Offer data secured' : null
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

// PUT booking status (auth-protected)
async function updateBooking(req: NextRequest) {
  const user = await getServerUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await req.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const ref = doc(db, 'bookings', id);
  await updateDoc(ref, { 
    status,
    updatedAt: Timestamp.now()
  });
  return NextResponse.json({ success: true });
}

export const GET = getBookings;
export const POST = createBooking;
export const PUT = updateBooking;
