import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export async function generateContract({ bookingId, clientId, providerId, serviceName, price }: {
  bookingId: string
  clientId: string
  providerId: string
  serviceName: string
  price: number
}) {
  const db = getFirestore(app)
  const ref = doc(db, 'contracts', bookingId)
  await setDoc(ref, {
    clientId,
    providerId,
    serviceName,
    price,
    createdAt: serverTimestamp(),
    status: 'pending',
    platformCut: Math.round(price * 0.2),
    providerCut: Math.round(price * 0.8),
  })
}
