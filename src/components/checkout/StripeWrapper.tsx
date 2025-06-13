'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const Elements = dynamic(() => import('@stripe/react-stripe-js').then(m => m.Elements), {
  ssr: false,
})

export default function StripeWrapper({ children }: { children: React.ReactNode }) {
  return <Elements stripe={stripePromise}>{children}</Elements>
}
