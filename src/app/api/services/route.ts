import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import withAuth from '@/app/api/_utils/withAuth';

interface Service {
  id?: string;
  title: string;
  description: string;
  price: number;
  creatorId: string;
  createdAt: number;
  updatedAt?: number;
}

interface CreateServiceRequest {
  title: string;
  description: string;
  price: number;
  [key: string]: any;
}

interface UpdateServiceRequest {
  id: string;
  updates: Partial<Service>;
}

interface DeleteServiceRequest {
  id: string;
}

interface AuthenticatedRequest extends NextRequest {
  user: {
    uid: string;
    email: string;
  };
}

// GET all services
async function getServices(): Promise<NextResponse<Service[]>> {
  const snap = await getDocs(collection(db, 'services'));
  const services: Service[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
  return NextResponse.json(services);
}

// POST new service
async function createService(req: AuthenticatedRequest): Promise<NextResponse<{ id: string } | { error: string }>> {
  const data: CreateServiceRequest = await req.json();

  if (!data.title || !data.description || !data.price) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const newService: Omit<Service, 'id'> = {
    ...data,
    creatorId: req.user.uid,
    createdAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, 'services'), newService);
  return NextResponse.json({ id: docRef.id });
}

// PUT update service
async function updateService(req: AuthenticatedRequest): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const { id, updates }: UpdateServiceRequest = await req.json();

  if (!id || !updates) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const ref = doc(db, 'services', id);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().creatorId !== req.user.uid) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await updateDoc(ref, { ...updates, updatedAt: Date.now() });

  return NextResponse.json({ success: true });
}

// DELETE service
async function deleteService(req: AuthenticatedRequest): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const { id }: DeleteServiceRequest = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'Missing service ID' }, { status: 400 });
  }

  const ref = doc(db, 'services', id);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().creatorId !== req.user.uid) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await deleteDoc(ref);
  return NextResponse.json({ success: true });
}

export const GET = getServices;
export const POST = withAuth(createService);
export const PUT = withAuth(updateService);
export const DELETE = withAuth(deleteService);
