import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/createCheckoutSession';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { logActivity } from '@/lib/firestore/logging/logActivity';

const CheckoutSchema = z.object({
  bookingId: z.string().min(1),
  price: z.number().positive(),
  buyerEmail: z.string().email(),
  providerId: z.string().min(1), // Optional: include if available
});

export async function POST(req: NextRequest) {
  try {
    // ✅ 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ 2. Parse + validate body
    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { bookingId, price, buyerEmail, providerId } = parsed.data;

    // ✅ 3. Create Stripe session
    const { url } = await createCheckoutSession({ bookingId, price, buyerEmail });

    // ✅ 4. Activity logging
    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await logActivity(session.user.id || session.user.email, 'checkout_initiated', {
      bookingId,
      price,
      providerId,
    }, {
      ip,
      userAgent,
    });

    // ✅ 5. Return the session URL
    return NextResponse.json({ url });

  } catch (err: any) {
    console.error('❌ Stripe session failed:', err?.message || err);

    // ✅ 6. Firestore error log
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
