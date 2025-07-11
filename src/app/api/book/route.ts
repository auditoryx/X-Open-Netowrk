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
import { BookingRequestSchema } from '@/lib/schema';
import { SCHEMA_FIELDS } from '@/lib/@schema';
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
    if (serviceId) constraints.push(where(SCHEMA_FIELDS.BOOKING_REQUEST.SERVICE_ID, '==', serviceId));
    if (date) constraints.push(where(SCHEMA_FIELDS.BOOKING_REQUEST.DATE, '==', date));
    if (time) constraints.push(where(SCHEMA_FIELDS.BOOKING_REQUEST.TIME, '==', time));

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
      [SCHEMA_FIELDS.BOOKING_REQUEST.SERVICE_ID]: serviceId,
      [SCHEMA_FIELDS.BOOKING_REQUEST.DATE]: date,
      [SCHEMA_FIELDS.BOOKING_REQUEST.TIME]: time,
      [SCHEMA_FIELDS.BOOKING_REQUEST.MESSAGE]: message,
      [SCHEMA_FIELDS.BOOKING_REQUEST.QUOTE]: quote,
      [SCHEMA_FIELDS.BOOKING_REQUEST.BUYER_ID]: session.user.id,
      [SCHEMA_FIELDS.BOOKING_REQUEST.STATUS]: 'pending',
      [SCHEMA_FIELDS.BOOKING_REQUEST.CREATED_AT]: serverTimestamp(),
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
