import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/createCheckoutSession';
import { getServerSession } from 'next-auth';
// Update the import path below if '@/lib/auth' is incorrect
import { authOptions } from '@/lib/authOptions';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

// Zod input validation
const CheckoutSchema = z.object({
  bookingId: z.string().min(1),
  price: z.number().positive(),
  buyerEmail: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    // ✅ 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ 2. Parse + validate body
    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
    }

    const { bookingId, price, buyerEmail } = parsed.data;

    // ✅ 3. Create Stripe session
    const url = await createCheckoutSession({ bookingId, price, buyerEmail });
    return NextResponse.json({ url });

  } catch (err: any) {
    console.error('❌ Stripe session failed:', err?.message || err);

    // ✅ 4. Log to Firestore for audit trail
    try {
      await addDoc(collection(db, 'errorLogs'), {
        type: 'stripe_checkout_error',
        message: err?.message || 'Unknown error',
        timestamp: serverTimestamp(),
      });
    } catch (logErr) {
      console.error('🔥 Failed to log error to Firestore:', logErr);
    }

    return NextResponse.json({ error: 'Stripe session failed' }, { status: 500 });
  }
}
