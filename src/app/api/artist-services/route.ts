import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/lib/firebase';
import { adminApp } from '@lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

interface ArtistService {
  id?: string;
  artistId: string;
  service: string;
  description: string;
  createdAt: any;
}

interface CreateArtistServiceRequest {
  artistId: string;
  service: string;
  description: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const db = getFirestore(app);
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const { artistId, service, description }: CreateArtistServiceRequest = await req.json();

    if (artistId !== decoded.uid) {
      return NextResponse.json({ error: 'Unauthorized artistId' }, { status: 403 });
    }

    if (!artistId || !service || !description) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await addDoc(collection(db, 'artistServices'), {
      artistId,
      service,
      description,
      createdAt: serverTimestamp()
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse<{ services: ArtistService[] } | { error: string }>> {
  try {
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'artistServices'));
    const services: ArtistService[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArtistService));
    return NextResponse.json({ services });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
