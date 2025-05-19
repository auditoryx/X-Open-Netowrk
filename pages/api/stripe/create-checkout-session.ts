import type { NextApiRequest, NextApiResponse } from 'next';
import { createCheckoutSession } from '@/lib/stripe/createCheckoutSession';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions'; // ✅ Confirm this exists
import { z } from 'zod';

const schema = z.object({
  bookingId: z.string().min(1),
  price: z.number().positive(),
  buyerEmail: z.string().email(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const { bookingId, price, buyerEmail } = result.data;

  try {
    const url = await createCheckoutSession({ bookingId, price, buyerEmail });
    return res.status(200).json({ url });
  } catch (err) {
    console.error('❌ Stripe session failed:', err);
    return res.status(500).json({ error: 'Stripe session failed' });
  }
}
