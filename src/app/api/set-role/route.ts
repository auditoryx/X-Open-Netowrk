import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/app/firebase';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(req: NextRequest) {
  const { uid, role } = await req.json();
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
  return NextResponse.json({ success: true });
}
