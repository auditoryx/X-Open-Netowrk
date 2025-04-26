'use client'

import React, { useState } from 'react'
import BookingCalendar from './BookingCalendar'
import { useAuth } from '@/lib/hooks/useAuth'
import { createBooking } from '@/lib/firestore/createBooking'

type Props = {
  providerId: string
}

const BookingForm = ({ providerId }: Props) => {
  const { user } = useAuth()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!user || !date || !time) return
    await createBooking({ clientId: user.uid, providerId, date, time, note })
    setSubmitted(true)
  }

  return (
    <div className="p-4 border rounded-xl mt-6 max-w-xl">
      <BookingCalendar uid={providerId} />
      <div className="mt-4">
        <input
          type="text"
          placeholder="Optional note"
          className="w-full border p-2 rounded"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={!date || !time || submitted}
          className="mt-3 bg-black text-white px-4 py-2 rounded"
        >
          {submitted ? 'Request Sent' : 'Send Booking Request'}
        </button>
      </div>
    </div>
  )
}

export default BookingForm
