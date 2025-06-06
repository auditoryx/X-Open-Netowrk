import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmation } from '@/lib/email/sendBookingConfirmation';
import { z } from 'zod';

const Schema = z.object({
  email: z.string().email(),
  selectedTime: z.string(),
  message: z.string(),
  senderName: z.string().optional(),
  providerTZ: z.string().optional(),
  clientTZ: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = Schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const { email, selectedTime, message, senderName, providerTZ, clientTZ } = result.data;
    const res = await sendBookingConfirmation(email, selectedTime, message, senderName, providerTZ, clientTZ);
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
