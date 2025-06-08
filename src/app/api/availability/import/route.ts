import { NextRequest, NextResponse } from 'next/server';
import withAuth from '@/app/api/_utils/withAuth';
import { adminDb } from '@/lib/firebase-admin';
import { parseAvailability } from '@/lib/csv/parseAvailability';

const handler = async (req: NextRequest & { user: any }) => {
  const text = await req.text();
  const slots = parseAvailability(text);
  const uid = req.user.uid;

  const batch = adminDb.batch();
  const limit = Math.min(slots.length, 500);
  for (let i = 0; i < limit; i++) {
    const s = slots[i];
    const slotId = `${s.dateISO}_${s.startTime}_${s.endTime}`.replace(/:/g, '-');
    const ref = adminDb
      .collection('availability')
      .doc(uid)
      .collection(s.roomId)
      .doc(slotId);
    batch.set(ref, {
      date: s.dateISO,
      start: s.startTime,
      end: s.endTime,
      roomId: s.roomId,
      createdAt: Date.now(),
    });
  }
  await batch.commit();
  return NextResponse.json({ success: true, count: limit });
};

export const POST = withAuth(handler);
