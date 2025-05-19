import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const contractSchema = z.object({
  bookingId: z.string().min(1),
  buyerId: z.string().min(1),
  providerId: z.string().min(1),
  serviceName: z.string().min(1),
  price: z.number().positive(),
  startDate: z.string().min(4),
});

export async function generateContract(
  input: unknown,
  sessionUserId: string
) {
  const parsed = contractSchema.safeParse(input);
  if (!parsed.success) {
    console.error('Invalid contract input:', parsed.error.format());
    return { error: 'Invalid contract data' };
  }

  const {
    bookingId,
    buyerId,
    providerId,
    serviceName,
    price,
    startDate,
  } = parsed.data;

  // 🔐 Enforce that only buyer or provider can generate the contract
  if (![buyerId, providerId].includes(sessionUserId)) {
    console.warn('Unauthorized contract generation attempt by:', sessionUserId);
    return { error: 'You are not authorized to generate this contract.' };
  }

  const contractText = `
    SERVICE AGREEMENT

    This agreement is between ${buyerId} (Client) and ${providerId} (Provider).

    The Provider agrees to deliver the service "${serviceName}" starting on ${startDate}, 
    in exchange for payment of $${price}.

    Booking ID: ${bookingId}

    Both parties agree to the terms upon booking confirmation.
  `;

  try {
    await setDoc(doc(db, 'contracts', bookingId), {
      bookingId,
      buyerId,
      providerId,
      serviceName,
      price,
      startDate,
      contractText,
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (err: any) {
    console.error('Failed to generate contract:', err.message);
    return { error: 'Contract generation failed.' };
  }
}
// This function generates a contract for a booking between a buyer and a provider.
// It validates the input data, checks if the user is authorized to generate the contract,
// and then creates a contract document in Firestore with the relevant details.
// The contract includes the service name, price, start date, and a text representation of the agreement.
// If successful, it returns a success message; otherwise, it logs the error and returns an error message.
// The contract text is a simple template that outlines the agreement between the two parties.
// The function uses Zod for input validation and Firestore for data storage.
// The contract is stored in a Firestore collection named 'contracts' with the booking ID as the document ID.
// The function also includes error handling to catch any issues during the Firestore operations.
// The contract text is a simple template that outlines the agreement between the two parties.
// The function uses Zod for input validation and Firestore for data storage.
// The contract is stored in a Firestore collection named 'contracts' with the booking ID as the document ID.
// The function also includes error handling to catch any issues during the Firestore operations.
// The contract text is a simple template that outlines the agreement between the two parties.
// The function uses Zod for input validation and Firestore for data storage.
// The contract is stored in a Firestore collection named 'contracts' with the booking ID as the document ID.
// The function also includes error handling to catch any issues during the Firestore operations.
// The contract text is a simple template that outlines the agreement between the two parties.
// The function uses Zod for input validation and Firestore for data storage.
// The contract is stored in a Firestore collection named 'contracts' with the booking ID as the document ID.
// The function also includes error handling to catch any issues during the Firestore operations.
// The contract text is a simple template that outlines the agreement between the two parties.
// The function uses Zod for input validation and Firestore for data storage.