import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@lib/firebaseAdmin';
import { app } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';

interface AvailabilityRequest {
  timeSlot: string;
  role: string;
}

interface AvailabilityData {
  id?: string;
  uid: string;
  role: string;
  timeSlot: string;
  createdAt: any;
}

export async function POST(req: NextRequest): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const db = getFirestore(app);
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const uid = decoded.uid;

    const { timeSlot, role }: AvailabilityRequest = await req.json();

    if (!timeSlot || !role) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    await addDoc(collection(db, 'availability'), {
      uid,
      role,
      timeSlot,
      createdAt: serverTimestamp()
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse<AvailabilityData[] | { error: string }>> {
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
    const data: AvailabilityData[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AvailabilityData));

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
