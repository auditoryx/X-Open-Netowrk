import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/lib/firebase';
import { getServerUser } from '@/lib/auth/getServerUser';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// GET bookings (auth-protected)
async function getBookings(req: NextRequest) {
  const user = await getServerUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await getDocs(collection(db, 'bookings'));
  const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json(bookings);
}

// PUT booking status (auth-protected)
async function updateBooking(req: NextRequest) {
  const user = await getServerUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await req.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const ref = doc(db, 'bookings', id);
  await updateDoc(ref, { status });
  return NextResponse.json({ success: true });
}

export const GET = getBookings;
export const PUT = updateBooking;
