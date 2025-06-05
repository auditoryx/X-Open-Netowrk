import { NextRequest, NextResponse } from 'next/server';
import { createDispute } from '@/lib/firestore/disputes/createDispute';
import withAuth from '@/app/api/_utils/withAuth';

async function handler(req: NextRequest & { user: any }) {
  const user = req.user;

  const { bookingId, reason } = await req.json();
  if (!bookingId || !reason) return new NextResponse('Missing data', { status: 400 });

  await createDispute({
    bookingId,
    fromUser: user.uid,
    reason,
  });

  return new NextResponse('Dispute Created', { status: 200 });
}

export const POST = withAuth(handler);
