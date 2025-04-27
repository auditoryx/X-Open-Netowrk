import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/app/firebase';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function GET() {
  const snap = await getDocs(collection(db, 'services'));
  const services = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json(services);
}

export async function POST(req) {
  const data = await req.json();
  const ref = await addDoc(collection(db, 'services'), data);
  return NextResponse.json({ id: ref.id, ...data });
}

export async function PUT(req) {
  const { id, ...rest } = await req.json();
  const ref = doc(db, 'services', id);
  await updateDoc(ref, rest);
  return NextResponse.json({ success: true });
}

export async function DELETE(req) {
  const { id } = await req.json();
  await deleteDoc(doc(db, 'services', id));
  return NextResponse.json({ success: true });
}
