import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import withAuth from '@/app/utils/withAuth';

// GET all services
async function getServices() {
  const snap = await getDocs(collection(db, 'services'));
  const services = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json(services);
}

// POST new service
async function createService(req) {
  const data = await req.json();

  if (!data.title || !data.description || !data.price) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const newService = {
    ...data,
    creatorId: req.user.uid,
    createdAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, 'services'), newService);
  return NextResponse.json({ id: docRef.id });
}

// PUT update service
async function updateService(req) {
  const { id, updates } = await req.json();

  if (!id || !updates) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const ref = doc(db, 'services', id);
  await updateDoc(ref, { ...updates, updatedAt: Date.now() });

  return NextResponse.json({ success: true });
}

// DELETE service
async function deleteService(req) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'Missing service ID' }, { status: 400 });
  }

  await deleteDoc(doc(db, 'services', id));
  return NextResponse.json({ success: true });
}

export const GET = getServices;
export const POST = withAuth(createService);
export const PUT = withAuth(updateService);
export const DELETE = withAuth(deleteService);
