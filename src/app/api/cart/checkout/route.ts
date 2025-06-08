import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { createGroupBooking } from '@/lib/firestore/createGroupBooking'
import { createGroupBookingSession } from '@/lib/stripe/createGroupBookingSession'
import { checkBookingConflict } from '@/lib/firestore/checkBookingConflict'

const ItemSchema = z.object({
  serviceId: z.string().min(1),
  providerId: z.string().min(1),
  serviceName: z.string().min(1),
  price: z.number().positive(),
  dateTime: z.string().min(1),
})

const Schema = z.object({ items: z.array(ItemSchema).min(1) })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.format() }, { status: 400 })
  }

  const items = parsed.data.items

  for (const item of items) {
    const conflict = await checkBookingConflict(item.providerId, item.dateTime)
    if (conflict) {
      return NextResponse.json({ error: 'Time slot unavailable', serviceId: item.serviceId }, { status: 409 })
    }
  }

  const groupId = await createGroupBooking(session.user.id, items)
  const sessionRes = await createGroupBookingSession(groupId, session.user.id, items)

  return NextResponse.json({ url: sessionRes.url })
}
