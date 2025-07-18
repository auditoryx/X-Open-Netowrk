import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { logActivity } from '@/lib/firestore/logging/logActivity';

const contractSchema = z.object({
  bookingId: z.string().min(1),
  clientId: z.string().min(1),
  providerId: z.string().min(1),
  serviceName: z.string().min(1),
  price: z.number().positive(),
  startDate: z.string().min(4),
  providerPayout: z.object({
    providerAmount: z.number(),
    platformFee: z.number(),
    totalAmount: z.number(),
  }).optional(),
});

export async function generateContract(
  input: unknown,
  sessionUserId: string
) {
  const parsed = contractSchema.safeParse(input);
  if (!parsed.success) {
    console.error('❌ Invalid contract input:', parsed.error.format());
    return { error: 'Invalid contract data' };
  }

  const {
    bookingId,
    clientId,
    providerId,
    serviceName,
    price,
    startDate,
    providerPayout,
  } = parsed.data;

  // 🔐 Authorization check
  if (![clientId, providerId].includes(sessionUserId) && sessionUserId !== 'system') {
    console.warn('⚠️ Unauthorized contract generation attempt by:', sessionUserId);
    return { error: 'Unauthorized' };
  }

  const payoutText = providerPayout 
    ? `\n\nPayment Breakdown:\n- Total Amount: $${providerPayout.totalAmount}\n- Platform Fee (20%): $${providerPayout.platformFee}\n- Provider Payout (80%): $${providerPayout.providerAmount}`
    : '';

  const contractText = `
    SERVICE AGREEMENT

    This agreement is between ${clientId} (Client) and ${providerId} (Provider).

    The Provider agrees to deliver the service "${serviceName}" starting on ${startDate}, 
    in exchange for payment of $${price}.${payoutText}

    Booking ID: ${bookingId}

    Both parties agree to the terms upon booking confirmation.
  `;

  try {
    await setDoc(doc(db, 'contracts', bookingId), {
      bookingId,
      clientId,
      providerId,
      serviceName,
      price,
      startDate,
      contractText,
      payoutDetails: providerPayout || null,
      status: 'active',
      createdAt: serverTimestamp(),
    });

    await logActivity(sessionUserId, 'contract_generated', {
      bookingId,
      providerId,
      clientId,
      price,
      startDate,
    });

    return { success: true };
  } catch (err: any) {
    console.error('🔥 Failed to generate contract:', err.message);
    return { error: 'Contract generation failed' };
  }
}
