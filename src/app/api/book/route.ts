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
} from 'firebase/firestore';
import { z } from 'zod';
import { logActivity } from '@/lib/firestore/logging/logActivity';
import { logger } from '@lib/logger';

const BookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.format() },
      { status: 400 }
    );
  }

  const { serviceId, date, time, message } = parsed.data;

  try {
    const q = query(
      collection(db, 'bookingRequests'),
      where('serviceId', '==', serviceId),
      where('date', '==', date),
      where('time', '==', time)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return NextResponse.json(
        { error: 'Booking slot already taken' },
        { status: 409 }
      );
    }

    const docRef = await addDoc(collection(db, 'bookingRequests'), {
      serviceId,
      date,
      time,
      message,
      userId: session.user.id,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    await logActivity(session.user.id, 'booking_request_sent', {
      serviceId,
      date,
      time,
      message,
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
