import { admin } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;
    const snap = await admin.firestore().collection('users').doc(uid).get();
    if (!snap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(snap.data());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
