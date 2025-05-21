import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebaseAdmin';
import { app } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const db = getFirestore(app);
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const { timeSlot, studioId } = await req.json();

    if (!timeSlot || !studioId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await addDoc(collection(db, 'studioAvailability'), {
      studioId,
      timeSlot,
      createdBy: decoded.uid,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'studioAvailability'));
    const slots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ slots }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
