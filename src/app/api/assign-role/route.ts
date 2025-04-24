import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  const { uid, role } = await req.json();

  try {
    await getAuth(admin).setCustomUserClaims(uid, { role });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting role:', error);
    return NextResponse.json({ error: 'Role assignment failed' }, { status: 500 });
  }
}
