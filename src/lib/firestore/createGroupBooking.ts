import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { CartItem } from '@/context/CartContext'
import { adminApp } from '@lib/firebaseAdmin';

export async function createGroupBooking(userId: string, items: CartItem[]) {
  if (!adminApp) {
    throw new Error('Firebase Admin not initialized');
  }
  
  const adminDb = adminApp.firestore()
  const ref = await adminDb.collection('groupBookings').add({
    userId,
    services: items,
    status: 'pending',
    createdAt: adminApp.firestore.FieldValue.serverTimestamp(),
  })
  return ref.id
}
