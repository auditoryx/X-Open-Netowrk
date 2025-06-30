'use client'

import { useEffect, useState, useCallback } from 'react'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Props = {
  uid: string
}

export default function BookingsList({ uid }: Props) {
  const [bookings, setBookings] = useState<any[]>([])
  const [lastDoc, setLastDoc] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const loadMore = useCallback(async () => {
    setLoading(true)
    const base = query(
      collection(db, 'bookings'),
      where('userId', '==', uid),
      orderBy('date', 'desc'),
      limit(10)
    )
    const q = lastDoc ? query(base, startAfter(lastDoc)) : base
    const snapshot = await getDocs(q)
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || lastDoc)
    setBookings(prev => [...prev, ...docs])
    setLoading(false)
  }, [db, lastDoc, uid])

  useEffect(() => {
    loadMore()
  }, [loadMore, uid])

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
      {lastDoc && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-2 px-4 py-2 bg-neutral-800 rounded text-white"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
