import { agreeToContract } from '@/lib/firestore/contracts/agreeToContract';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { logActivity } from '@/lib/firestore/logging/logActivity';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  bookingId: z.string().min(1),
  role: z.enum(['client', 'provider']),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { bookingId, role } = parsed.data;
    const result = await agreeToContract(bookingId, role, session.user.id);

    if (result.success) {
      await logActivity(session.user.id, 'contract_agreed', { bookingId, role });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Agreement API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
