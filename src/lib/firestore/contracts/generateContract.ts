import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function generateContract({
  bookingId,
  buyerId,
  providerId,
  serviceName,
  price,
  startDate,
}: {
  bookingId: string;
  buyerId: string;
  providerId: string;
  serviceName: string;
  price: number;
  startDate: string;
}) {
  const contractText = `
    SERVICE AGREEMENT

    This agreement is between ${buyerId} (Client) and ${providerId} (Provider).

    The Provider agrees to deliver the service "${serviceName}" starting on ${startDate}, 
    in exchange for payment of $${price}.

    Booking ID: ${bookingId}

    Both parties agree to the terms upon booking confirmation.
  `;

  await setDoc(doc(db, 'contracts', bookingId), {
    bookingId,
    buyerId,
    providerId,
    serviceName,
    price,
    startDate,
    contractText,
    createdAt: new Date(),
  });
}
