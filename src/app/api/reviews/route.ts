import { db } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const { bookingId, reviewerId, reviewedId, text, rating } = await req.json();

  if (!bookingId || !reviewerId || !reviewedId || !text || !rating) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await addDoc(collection(db, 'reviews'), {
    bookingId,
    reviewerId,
    reviewedId,
    text,
    rating,
    createdAt: Timestamp.now(),
  });

  return NextResponse.json({ success: true });
}
