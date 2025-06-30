import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { NextResponse } from 'next/server'

export default function withAuth(handler: (req: any, ...args: any[]) => Promise<Response | NextResponse> | Response | NextResponse) {
  return async function(req: any, ...args: any[]) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    req.user = session.user
    return handler(req, ...args)
  }
}
