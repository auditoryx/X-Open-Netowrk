import { adminApp } from '@lib/firebaseAdmin';
import { getFirestore, doc, setDoc, getDoc } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';

const db = getFirestore(adminApp);

const AvailabilitySchema = z.object({
  location: z.string().min(1),
  availability: z.array(z.object({
    day: z.string(),
    time: z.string()
  }))
});

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing token' }), { status: 401 });
    }

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const data = await req.json();
    const parsed = AvailabilitySchema.safeParse(data);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', issues: parsed.error.format() }), { status: 400 });
    }

    const { location, availability } = parsed.data;

    await setDoc(doc(db, 'userAvailability', decoded.uid), {
      location,
      availability,
      uid: decoded.uid,
      updatedAt: Date.now()
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('❌ Availability POST failed:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing token' }), { status: 401 });
    }
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const uid = searchParams.get('uid');

    if (!uid) {
      return new Response(JSON.stringify({ error: 'Missing uid' }), { status: 400 });
    }
    if (uid !== decoded.uid) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const docSnap = await getDoc(doc(db, 'userAvailability', uid));
    return new Response(JSON.stringify(docSnap.exists ? docSnap.data() : {}), { status: 200 });
  } catch (err) {
    console.error('❌ Availability GET failed:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
