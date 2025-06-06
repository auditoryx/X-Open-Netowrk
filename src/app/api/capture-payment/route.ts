import { updatePayoutStatus } from '@/lib/stripe/updatePayoutStatus';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import withAuth from '@/app/api/_utils/withAuth';
import { logger } from '@lib/logger';

async function handler(req: NextRequest & { user: any }) {
  const schema = z.object({
    paymentIntentId: z.string().min(1),
  });

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
  }

  const { paymentIntentId } = parsed.data;

  try {
    await updatePayoutStatus(paymentIntentId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    logger.error('❌ Capture Payment Error:', err?.message || err);
    await addDoc(collection(db, 'stripe_logs'), {
      type: 'capture_payment_error',
      error: err?.message || 'Unknown error',
      paymentIntentId,
      userId: req.user.uid,
      createdAt: serverTimestamp(),
    });
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
