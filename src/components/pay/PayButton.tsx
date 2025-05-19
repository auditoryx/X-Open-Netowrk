'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function PayButton({ service, buyerId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (loading) return // debounce double clicks
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
          buyerId: buyerId,
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
// This button handles the payment process for a service.
// It sends a request to the server to create a Stripe checkout session.
// If successful, it redirects the user to the Stripe checkout page.
// If there's an error, it shows a toast notification.
// The button is disabled while the request is in progress to prevent double clicks.
// The button's appearance changes based on the loading state.
// The button is styled with Tailwind CSS classes for a consistent look and feel.
// The button is designed to be used in a service detail page or similar context.
// The button is a functional component that uses React hooks for state management.
// The button uses the Next.js router for navigation.
// The button uses the react-hot-toast library for notifications.