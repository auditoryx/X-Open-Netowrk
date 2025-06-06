import { NextRequest, NextResponse } from 'next/server';
import withAuth from '@/app/api/_utils/withAuth';
import { markAsReleased } from '@/lib/firestore/bookings/markAsReleased';

async function handler(req: NextRequest & { user: any }) {
  const { bookingId } = await req.json();
  if (!bookingId) {
    return NextResponse.json({ error: 'Invalid bookingId' }, { status: 400 });
  }

  const result = await markAsReleased({ bookingId, userId: req.user.id || req.user.uid });
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export const POST = withAuth(handler);
