import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import withAuth from '@/app/api/_utils/withAuth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

async function handler(req: any & { user: any }) {
  const user = req.user

  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
  })

  // Save account ID to Firestore
  await setDoc(doc(db, 'users', user.id), {
    stripeAccountId: account.id,
  }, { merge: true })

  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings`,
    return_url: process.env.STRIPE_CONNECT_REDIRECT_URL!,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: link.url })
}

export const POST = withAuth(handler)
