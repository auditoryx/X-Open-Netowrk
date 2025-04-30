import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/createCheckoutSession';

export async function POST(req: NextRequest) {
  const { bookingId, price, buyerEmail } = await req.json();

  try {
    const url = await createCheckoutSession({ bookingId, price, buyerEmail });
    return NextResponse.json({ url });
  } catch (err) {
    console.error('❌ Failed to create Stripe session:', err);
    return NextResponse.json({ error: 'Stripe session failed' }, { status: 500 });
  }
}
