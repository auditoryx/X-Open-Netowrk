import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const { bookingId } = await req.json();

  const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
  const paymentIntentId = bookingSnap.data()?.paymentIntentId;

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'No PaymentIntent found' }, { status: 400 });
  }

  try {
    const captured = await stripe.paymentIntents.capture(paymentIntentId);
    return NextResponse.json({ success: true, captured });
  } catch (err: any) {
    console.error('❌ Capture failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
