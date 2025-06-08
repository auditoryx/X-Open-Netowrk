import { NextRequest, NextResponse } from 'next/server';
import withAuth from '@/app/api/_utils/withAuth';
import { requestRevision } from '@/lib/firestore/bookings/requestRevision';

async function handler(req: NextRequest & { user: any }) {
  const body = await req.json();
  const result = await requestRevision({
    bookingId: body.bookingId,
    userId: req.user.id || req.user.uid,
  });

  if ('error' in result) {
    const status = result.error === 'No revisions remaining' ? 400 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(result);
}

export const POST = withAuth(handler);
export { handler }; // for testing
