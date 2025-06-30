import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const db = getFirestore(app);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { uid, role } = await req.json();
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
  return NextResponse.json({ success: true });
}
