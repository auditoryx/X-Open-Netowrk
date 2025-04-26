<<<<<<< HEAD
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebaseAdmin';
import { app } from '@/lib/firebase';

export async function POST(req) {
  try {
    const db = getFirestore(app);
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const senderUid = decoded.uid;

    const { recipientUid, role, message, timeSlot } = await req.json();

    if (!recipientUid || !role || !timeSlot) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    await addDoc(collection(db, 'bookings'), {
      senderUid,
      recipientUid,
      role,
      message: message || '',
      timeSlot,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
=======
import { sendBookingRequest } from "../../../lib/bookingHelpers";

export async function POST(req) {
  const body = await req.json();
  const { senderId, recipientId, date, time, notes } = body;

  try {
    const bookingId = await sendBookingRequest({ senderId, recipientId, date, time, notes });
    return new Response(JSON.stringify({ bookingId }), { status: 200 });
  } catch (err) {
    console.error("Booking error:", err);
    return new Response("Failed to create booking", { status: 500 });
>>>>>>> 3126253 (chore: finalize migration prep for rebase)
  }
}
