import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const { bookingId } = await req.json();

  const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
  const paymentIntentId = bookingSnap.data()?.paymentIntentId;

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'No PaymentIntent found' }, { status: 400 });
  }

  try {
    const captured = await stripe.paymentIntents.capture(paymentIntentId);

    // ✅ Mark booking as completed in Firestore
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'completed',
      completedAt: new Date(),
    });

    return NextResponse.json({ success: true, captured });
  } catch (err: any) {
    console.error('❌ Capture failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
// Compare this snippet from src/app/api/capture-payment/route.ts:
// import { stripe } from '@/lib/stripe';
// import { db } from '@/lib/firebase';
// import { NextRequest, NextResponse } from 'next/server';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
//
// export async function POST(req: NextRequest) {
//   const { bookingId } = await req.json();
//    