import { adminApp } from '@lib/firebaseAdmin';
import { getFirestore, doc, setDoc, getDoc } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import { logger } from '@lib/logger';
import { NextRequest, NextResponse } from 'next/server';

let db: any = null;
let auth: any = null;

try {
  if (adminApp && adminApp.app) {
    db = getFirestore(adminApp);
    auth = getAuth(adminApp);
  }
} catch (error) {
  logger.error('Failed to initialize Firebase services:', error);
}

const AvailabilitySchema = z.object({
  location: z.string().min(1),
  availability: z.array(z.object({
    day: z.string(),
    time: z.string()
  }))
});

interface AvailabilitySlot {
  day: string;
  time: string;
}

interface UserAvailability {
  location: string;
  availability: AvailabilitySlot[];
  uid: string;
  updatedAt: number;
}

export async function POST(req: NextRequest): Promise<NextResponse<{ success: boolean } | { error: string; issues?: any }>> {
  try {
    if (!db || !auth) {
      return NextResponse.json({ error: 'Firebase services not available' }, { status: 503 });
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const decoded = await auth.verifyIdToken(token);
    const data = await req.json();
    const parsed = AvailabilitySchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
    }

    const { location, availability } = parsed.data;

    await setDoc(doc(db, 'userAvailability', decoded.uid), {
      location,
      availability,
      uid: decoded.uid,
      updatedAt: Date.now()
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    logger.error('❌ Availability POST failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse<UserAvailability | {} | { error: string }>> {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }
    if (uid !== decoded.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const docSnap = await getDoc(doc(db, 'userAvailability', uid));
    return NextResponse.json(docSnap.exists ? docSnap.data() : {});
  } catch (err: any) {
    logger.error('❌ Availability GET failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
