import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@lib/firebaseAdmin';
import { app } from '@/lib/firebase';

export async function POST(req) {
  try {
    const db = getFirestore(app);
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const uid = decoded.uid;

    const { timeSlot, role } = await req.json();

    if (!timeSlot || !role) {
      return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
    }

    await addDoc(collection(db, 'availability'), {
      uid,
      role,
      timeSlot,
      createdAt: serverTimestamp()
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function GET(req) {
  try {
    const db = getFirestore(app);
    const { searchParams } = new URL(req.url);
    const role = searchParams.get(SCHEMA_FIELDS.USER.ROLE);
    const uid = searchParams.get(SCHEMA_FIELDS.USER.ID);

    let q = collection(db, 'availability');

    if (role || uid) {
      const filters = [];
      if (role) filters.push(where(SCHEMA_FIELDS.USER.ROLE, '==', role));
      if (uid) filters.push(where(SCHEMA_FIELDS.USER.ID, '==', uid));
      filters.forEach(f => q = query(q, f));
    }

    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
