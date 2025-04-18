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
  }
}
