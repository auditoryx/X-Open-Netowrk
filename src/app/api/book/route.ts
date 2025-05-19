import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { logActivity } from '@/lib/firestore/logging/logActivity';

const BookingSchema = z.object({
  serviceId: z.string().min(1),
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
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
  }

  const { serviceId, message } = parsed.data;

  try {
    const docRef = await addDoc(collection(db, 'bookingRequests'), {
      serviceId,
      message,
      userId: session.user.id,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    await logActivity(session.user.id, 'booking_request_sent', {
      serviceId,
      message,
      requestId: docRef.id,
    });

    return NextResponse.json({ success: true, requestId: docRef.id });
  } catch (err: any) {
    console.error('❌ Booking request failed:', err.message);
    return NextResponse.json({ error: 'Failed to create booking request' }, { status: 500 });
  }
}
