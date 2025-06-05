import { NextRequest, NextResponse } from 'next/server';
import { resolveDispute } from '@/lib/firestore/disputes/resolveDispute';
import withAuth from '@/app/api/_utils/withAuth';

async function handler(req: NextRequest & { user: any }) {
  if (!req.user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { disputeId, status } = await req.json();
  if (!disputeId || !['resolved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  await resolveDispute(disputeId, status);
  return NextResponse.json({ success: true });
}

export const POST = withAuth(handler);
