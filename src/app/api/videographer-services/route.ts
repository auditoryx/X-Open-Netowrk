import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/lib/firebase';
import { adminApp } from '@lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

interface VideographerServiceData {
  videographerId: string;
  location: string;
  services: string[];
  portfolioLink: string;
  equipment: string[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db = getFirestore(app);
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    if (!token) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const { videographerId, location, services, portfolioLink, equipment }: VideographerServiceData = await req.json();

    if (videographerId !== decoded.uid) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized videographerId' }), { status: 403 });
    }

    if (!videographerId || !location || !services || !portfolioLink || !equipment) {
      return new NextResponse(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    await addDoc(collection(db, 'videographerServices'), {
      videographerId,
      location,
      services,
      portfolioLink,
      equipment,
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
    const snapshot = await getDocs(collection(db, 'videographerServices'));
    const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return new NextResponse(JSON.stringify({ listings }), { status: 200 });
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
}
