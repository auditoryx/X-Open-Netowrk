import { adminApp } from '@/lib/firebase/firebaseAdmin';
import { CartItem } from '@/context/CartContext';

export async function createGroupBooking(
  userId: string,
  items: CartItem[]
) {
  if (!adminApp) throw new Error('Firebase Admin not initialized');

  const adminDb = adminApp.firestore();
  const ref = await adminDb.collection('groupBookings').add({
    userId,
    services: items,
    status: 'pending',
    createdAt: adminApp.firestore.FieldValue.serverTimestamp(),
  });

  return ref.id;
}
