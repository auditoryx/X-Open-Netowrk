import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/lib/firebase';
import { adminApp } from '@lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

interface EngineerServiceData {
  engineerId: string;
  services: string[];
  daws: string[];
  rate: number;
  availability: string;
  contact: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = getFirestore(app);
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    if (!token) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const { engineerId, services, daws, rate, availability, contact }: EngineerServiceData = await req.json();

    if (engineerId !== decoded.uid) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized engineerId' }), { status: 403 });
    }

    if (!engineerId || !services || !daws || !rate || !availability || !contact) {
      return new NextResponse(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
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

    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'engineerServices'));
    const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return new NextResponse(JSON.stringify({ listings }), { status: 200 });
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
}
