import { updatePayoutStatus } from '@/lib/stripe/updatePayoutStatus';
import { NextRequest, NextResponse } from 'next/server';
import withAuth from '@/app/utils/withAuth';

async function handler(req: NextRequest & { user: any }) {
  const { paymentIntentId } = await req.json();

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });
  }

  try {
    await updatePayoutStatus(paymentIntentId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Capture Payment Error:', err?.message || err);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
