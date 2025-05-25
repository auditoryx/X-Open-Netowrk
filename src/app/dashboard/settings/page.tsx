'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)

  const handleStripeConnect = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/connect', {
      method: 'POST',
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert('Failed to start Stripe onboarding.')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <button
        onClick={handleStripeConnect}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Redirecting...' : 'Connect Stripe for Payouts'}
      </button>
    </div>
  )
}
