import { NextResponse } from 'next/server';
import { getFirestore, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/app/firebase';
import withAuth from '@/app/utils/withAuth';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// GET bookings (auth-protected)
async function getBookings(req) {
  const snap = await getDocs(collection(db, 'bookingRequests'));
  const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json(bookings);
}

// PUT booking status (auth-protected)
async function updateBooking(req) {
  const { id, status } = await req.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const ref = doc(db, 'bookingRequests', id);
  await updateDoc(ref, { status });
  return NextResponse.json({ success: true });
}

// Export protected routes
export const GET = withAuth(getBookings);
export const PUT = withAuth(updateBooking);
