'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { loadStripe } from '@stripe/stripe-js'
import { createCheckoutSession } from '@/lib/stripe/createCheckoutSession'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

type Props = {
  bookingId: string
  serviceName: string
  price: number
}

const ContractViewer = ({ bookingId, serviceName, price }: Props) => {
  const { user } = useAuth()

  const handleCheckout = async () => {
    if (!user) return
    const session = await createCheckoutSession({ bookingId, price })
    const stripe = await stripePromise
    await stripe?.redirectToCheckout({ sessionId: session.id })
  }

  return (
    <div className="mt-4 p-4 border rounded-xl">
      <h3 className="text-lg font-semibold mb-2">Service Agreement</h3>
      <p className="text-sm mb-2">Booking for: {serviceName}</p>
      <p className="text-sm mb-2">Total Price: ¥{price}</p>
      <button
        onClick={handleCheckout}
        className="mt-2 bg-black text-white px-4 py-2 rounded"
      >
        Agree & Pay
      </button>
    </div>
  )
}

export default ContractViewer
