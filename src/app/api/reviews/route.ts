import { db } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import withAuth from '@/app/utils/withAuth';

async function handler(req: NextRequest & { user: any }) {
  const { bookingId, reviewedId, text, rating } = await req.json();

  if (!bookingId || !reviewedId || !text || !rating) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await addDoc(collection(db, 'reviews'), {
    bookingId,
    reviewerId: req.user.uid,
    reviewedId,
    text,
    rating,
    createdAt: Timestamp.now(),
  });

  return NextResponse.json({ success: true });
}

export const POST = withAuth(handler);
