import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/lib/firebase';
import { adminApp } from '@lib/firebaseAdmin';

export async function POST(req) {
  try {
    const db = getFirestore(app);
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const { engineerId, services, daws, rate, availability, contact } = await req.json();

    if (engineerId !== decoded.uid) {
      return new Response(JSON.stringify({ error: 'Unauthorized engineerId' }), { status: 403 });
    }

    if (!engineerId || !services || !daws || !rate || !availability || !contact) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    await addDoc(collection(db, 'engineerServices'), {
      engineerId,
      services,
      daws,
      rate,
      availability,
      contact,
      createdAt: serverTimestamp()
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'engineerServices'));
    const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return new Response(JSON.stringify({ listings }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
