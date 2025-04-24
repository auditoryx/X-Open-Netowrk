'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Props = {
  uid: string
}

export default function BookingsList({ uid }: Props) {
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    const fetchBookings = async () => {
      const q = query(collection(db, 'bookings'), where('userId', '==', uid))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setBookings(data)
    }

    fetchBookings()
  }, [uid])

  if (!bookings.length) return <p>No bookings found.</p>

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Your Bookings</h2>
      <ul className="border rounded p-4 space-y-2">
        {bookings.map(booking => (
          <li key={booking.id} className="border-b last:border-b-0 py-2">
            <strong>Service:</strong> {booking.serviceName} <br />
            <strong>Date:</strong> {booking.date}
          </li>
        ))}
      </ul>
    </div>
  )
}
