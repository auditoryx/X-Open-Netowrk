import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/createCheckoutSession';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { logActivity } from '@/lib/firestore/logging/logActivity';
import { getServerUser } from '@/lib/auth/getServerUser';
import { logger } from '@/lib/logger';

const CheckoutSchema = z.object({
  bookingId: z.string().min(1),
  amount: z.number().positive(),
  buyerEmail: z.string().email(),
  providerId: z.string().min(1),
});

async function handler(req: NextRequest) {
  const user = await getServerUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { bookingId, amount, buyerEmail, providerId } = parsed.data;

    const { url } = await createCheckoutSession({ bookingId, amount, buyerEmail, metadata: { providerId } });

    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await logActivity(user.uid || user.email, 'checkout_initiated', {
      bookingId,
      amount,
      providerId,
    }, {
      ip,
      userAgent,
    });

    return NextResponse.json({ url });

  } catch (err: any) {
    logger.error('❌ Stripe session failed:', err?.message || err);

    try {
      await addDoc(collection(db, 'stripe_logs'), {
        type: 'checkout_session_error',
        message: err?.message || 'Unknown error',
        bookingId: parsed?.data?.bookingId || 'unknown',
        providerId: parsed?.data?.providerId || 'unknown',
        userId: user.uid || 'unknown',
        ip: req.headers.get('x-forwarded-for') || req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        createdAt: serverTimestamp(),
      });
    } catch (logErr) {
      logger.error('🔥 Failed to log error to Firestore:', logErr);
    }

    return NextResponse.json({ error: 'Stripe session failed' }, { status: 500 });
  }
}

export const POST = handler;
