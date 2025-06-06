import { NextRequest, NextResponse } from 'next/server'
import withAuth from '@/app/api/_utils/withAuth'
import { generateReferralCode, redeemReferralCode } from '@/lib/referrals'

export const GET = withAuth(async (req: NextRequest & { user: any }) => {
  const code = await generateReferralCode(req.user.uid)
  return NextResponse.json({ code })
})

export const POST = withAuth(async (req: NextRequest & { user: any }) => {
  const { code } = await req.json()
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }
  const success = await redeemReferralCode(req.user.uid, code)
  if (!success) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
  }
  return NextResponse.json({ success: true })
})
