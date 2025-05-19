import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { admin } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  uid: z.string().min(1),
  banned: z.boolean(),
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

  const { uid, banned } = parsed.data;

  try {
    await admin.firestore().collection('users').doc(uid).update({ banned });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
