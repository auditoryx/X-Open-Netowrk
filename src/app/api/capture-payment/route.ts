import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logActivity } from '@/lib/firestore/logging/logActivity';

const BodySchema = z.object({
  bookingId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
  }

  const { bookingId } = parsed.data;

  try {
    const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
    const paymentIntentId = bookingSnap.data()?.paymentIntentId;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'No PaymentIntent found' }, { status: 400 });
    }

    const captured = await stripe.paymentIntents.capture(paymentIntentId);

    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'completed',
      completedAt: serverTimestamp(),
    });

    await logActivity(session.user.id || session.user.email, 'payment_captured', {
      bookingId,
      paymentIntentId,
    });

    return NextResponse.json({ success: true, captured });

  } catch (err: any) {
    console.error('❌ Stripe capture failed:', err.message);

    try {
      await addDoc(collection(db, 'errorLogs'), {
        type: 'stripe_capture_error',
        bookingId,
        message: err?.message || 'Unknown error',
        timestamp: serverTimestamp(),
      });
    } catch (logErr) {
      console.error('🔥 Failed to log error to Firestore:', logErr);
    }

    return NextResponse.json({ error: 'Payment capture failed' }, { status: 500 });
  }
}
