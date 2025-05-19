'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState } from 'react'

type PayButtonProps = {
  service: {
    id: string
    title: string
    price: number
    creatorId: string
  }
  buyerId: string
}

export default function PayButton({ service, buyerId }: PayButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceTitle: service.title,
          price: service.price,
          providerId: service.creatorId,
          buyerId,
        }),
      })

      if (!res.ok) throw new Error('Stripe session creation failed.')

      const { url } = await res.json()
      router.push(url)
    } catch (err) {
      console.error('Stripe Error:', err)
      toast.error('Payment failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`border text-white px-6 py-3 rounded transition ${
        loading
          ? 'bg-gray-500 border-gray-500 cursor-not-allowed'
          : 'border-white hover:bg-white hover:text-black'
      }`}
    >
      {loading ? 'Redirecting...' : 'Book Now'}
    </button>
  )
}
// This component is a button that initiates a payment process using Stripe.
// It takes a service object and a buyerId as props.
// The service object contains details about the service being purchased, including its ID, title, price, and the ID of the service provider.
// When the button is clicked, it sends a request to the server to create a Stripe checkout session.
// If the request is successful, it redirects the user to the Stripe checkout page.
// If there is an error during the process, it logs the error and shows a toast notification to the user.
// The button is disabled while the payment process is ongoing to prevent multiple clicks.
// The button's appearance changes based on the loading state, providing visual feedback to the user.