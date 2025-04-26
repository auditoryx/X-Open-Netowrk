import { adminApp } from '@/lib/firebaseAdmin';
import { getFirestore, doc, setDoc, getDoc } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const db = getFirestore(adminApp);

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const body = await req.json();
    const { location, availability } = body;

    await setDoc(doc(db, 'userAvailability', decoded.uid), {
      location,
      availability,
      uid: decoded.uid,
      updatedAt: Date.now()
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    if (!uid) return new Response(JSON.stringify({ error: 'Missing uid' }), { status: 400 });

    const docSnap = await getDoc(doc(db, 'userAvailability', uid));
    if (!docSnap.exists()) return new Response(JSON.stringify({}), { status: 200 });

    return new Response(JSON.stringify(docSnap.data()), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
