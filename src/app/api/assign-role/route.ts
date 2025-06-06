import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebase-admin';
import withAuth from '@/app/api/_utils/withAuth';
import { logger } from '@/lib/logger';

async function handler(req: NextRequest & { user: any }) {
  if (req.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { uid, role } = await req.json();

  try {
    await getAuth(admin).setCustomUserClaims(uid, { role });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error setting role:', error);
    return NextResponse.json({ error: 'Role assignment failed' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
