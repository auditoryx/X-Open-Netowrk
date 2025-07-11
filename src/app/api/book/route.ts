import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  QueryConstraint,
} from 'firebase/firestore';
import { BookingRequestSchema, validateBookingRequest } from '@/lib/schema';
import { logActivity } from '@/lib/firestore/logging/logActivity';
import { logger } from '@lib/logger';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = BookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.format() },
      { status: 400 }
    );
  }

  const { serviceId, date, time, message, quote } = parsed.data;

  try {
    const constraints: QueryConstraint[] = [];
    if (serviceId) constraints.push(where('serviceId', '==', serviceId));
    if (date) constraints.push(where('date', '==', date));
    if (time) constraints.push(where('time', '==', time));

    if (constraints.length > 0) {
      const q = query(collection(db, 'bookingRequests'), ...constraints);
      const snap = await getDocs(q);
      if (!snap.empty) {
        return NextResponse.json(
          { error: 'Booking slot already taken' },
          { status: 409 }
        );
      }
    }

    const docRef = await addDoc(collection(db, 'bookingRequests'), {
      serviceId,
      date,
      time,
      message,
      quote,
      buyerId: session.user.id,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    await logActivity(session.user.id, 'booking_request_sent', {
      serviceId,
      date,
      time,
      message,
      quote,
      requestId: docRef.id,
    });

    return NextResponse.json({ success: true, requestId: docRef.id });
  } catch (err: any) {
    logger.error('❌ Booking request failed:', err.message);
    return NextResponse.json(
      { error: 'Failed to create booking request' },
      { status: 500 }
    );
  }
}
