import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const db = getFirestore(app);
    const data = await req.json();

    if (!data.creatorUid || !data.title || !data.price || !data.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, 'services'), {
      ...data,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('POST /api/services error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'services'));

    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(services);
  } catch (error) {
    console.error('GET /api/services error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
