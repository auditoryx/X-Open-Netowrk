import { NextRequest, NextResponse } from 'next/server';
import { createDispute } from '@/lib/firestore/disputes/createDispute';
import { getServerUser } from '@/lib/getServerUser';

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { bookingId, reason } = await req.json();
  if (!bookingId || !reason) return new NextResponse('Missing data', { status: 400 });

  await createDispute({
    bookingId,
    fromUser: user.uid,
    reason,
  });

  return new NextResponse('Dispute Created', { status: 200 });
}
