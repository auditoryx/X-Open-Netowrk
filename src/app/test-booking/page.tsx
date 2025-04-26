'use client'

import React, { useState } from 'react'

export default function TestBookingPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: 'test-provider-123',
        serviceId: 'test-service-456',
        userId: 'test-user-789',
        date: '2025-04-30',
        time: '15:00',
        message: 'Test booking message',
      }),
    })

    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-bold mb-4">🧪 Test Booking API</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Test Booking'}
        </button>
      </form>

      {result && (
        <pre className="mt-6 bg-gray-800 p-4 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
