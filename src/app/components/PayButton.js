'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function PayButton({ service, buyerId }) {
  const router = useRouter()

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          serviceTitle: service.title,
          price: service.price,
          providerId: service.creatorId,
          buyerId: buyerId,
        }),
      })

      if (!res.ok) {
        throw new Error('Stripe session creation failed.')
      }

      const { url } = await res.json()
      router.push(url)
    } catch (err) {
      console.error('Stripe Error:', err)
      toast.error('Payment failed. Please try again.')
    }
  }

  return (
    <button
      onClick={handleCheckout}
      className="border border-white text-white px-6 py-3 rounded hover:bg-white hover:text-black transition"
    >
      Book Now
    </button>
  )
}
// This button is used to initiate the checkout process for a service.
// It sends a request to the server to create a Stripe checkout session.
// If successful, it redirects the user to the Stripe checkout page.
// If there is an error, it logs the error and shows a toast notification.
// The button is styled with a border, padding, and hover effects.
// The button is used in the service details page to allow users to book a service.
// The button is styled with a border, padding, and hover effects.
// The button is used in the service details page to allow users to book a service.
// The button is styled with a border, padding, and hover effects.
// The button is used in the service details page to allow users to book a service.
// The button is styled with a border, padding, and hover effects.