import { createSubscriptionSession } from '@/lib/stripe/createSubscriptionSession';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = await createSubscriptionSession();
    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to create subscription session.' }, { status: 500 });
  }
}
