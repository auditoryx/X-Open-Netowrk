import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import withAuth from '@/app/utils/withAuth';

async function handler(req: NextRequest & { user: any }) {
  if (req.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { uid, role } = await req.json();

  if (!uid || !role) {
    return NextResponse.json({ error: 'Missing uid or role' }, { status: 400 });
  }

  // Optional: limit who can promote
  // if (req.user.role !== 'admin') {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // }

  await updateDoc(doc(db, 'users', uid), { role });

  return NextResponse.json({ success: true });
}

export const POST = withAuth(handler);
