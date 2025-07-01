import { NextRequest, NextResponse } from 'next/server';
import { requestRevision } from '@/lib/firestore/bookings/requestRevision';
import { verifyAuth } from '@/app/api/_utils/withAuth'; // Fixed import to match export in withAuth

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const result = await requestRevision({
    bookingId: body.bookingId,
    userId: user.id || user.uid,
  });

  if ('error' in result) {
    const status = result.error === 'No revisions remaining' ? 400 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(result);
}
