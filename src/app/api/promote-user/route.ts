import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { logActivity } from '@/lib/firestore/logging/logActivity';
import { z } from 'zod';

const schema = z.object({
  uid: z.string().min(1),
  role: z.enum(['user', 'pro', 'verified', 'admin']),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { uid, role } = parsed.data;

  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    await admin.firestore().collection('users').doc(uid).update({ role });

    await logActivity(session.user.id, 'role_promoted', { target: uid, role });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Promotion error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
