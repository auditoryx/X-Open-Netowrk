import { NextResponse } from 'next/server';
import { getFirestore, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/app/firebase';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function GET() {
  const snap = await getDocs(collection(db, 'bookingRequests'));
  const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json(bookings);
}

export async function PUT(req) {
  const { id, status } = await req.json();
  const ref = doc(db, 'bookingRequests', id);
  await updateDoc(ref, { status });
  return NextResponse.json({ success: true });
}
