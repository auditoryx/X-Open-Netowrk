import { NextRequest, NextResponse } from 'next/server'
import { sendInAppAndEmail } from '@/lib/notifications/sendInAppAndEmail'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const { toUid, type, payload } = await req.json()
    if (!toUid || !type || !payload) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    await sendInAppAndEmail({ toUid, type, payload })
    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('Notification error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
