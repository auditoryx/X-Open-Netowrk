'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../lib/hooks/useAuth'
import { getUserBookings } from '@/lib/firestore/getUserBookings'
import BookingChatThread from '@/components/chat/BookingChatThread'

const BookingsDashboard = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    getUserBookings(user.uid).then(setBookings)
  }, [user])

  if (!user) return <p>Loading…</p>
  if (!bookings.length) return <p>No bookings found.</p>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Bookings</h1>
      <div className="grid gap-6">
        {bookings.map((b) => (
          <div key={b.id} className="border rounded-xl p-4">
            <p className="font-medium">{b.date} at {b.time}</p>
            <p className="text-sm text-gray-600">Client: {b.clientId}</p>
            <p className="text-sm text-gray-600">Status: {b.status}</p>
            <BookingChatThread bookingId={b.id} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookingsDashboard
