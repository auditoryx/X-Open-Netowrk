'use client'

import React, { useEffect, useState } from 'react'
import { getAvailabilityTemplate } from '@/lib/firestore/getAvailabilityTemplate'
import { getUserBookings } from '@/lib/firestore/getUserBookings'
import { generateSlots } from '@/lib/booking/generateSlots'

type Props = {
  uid: string
}

const BookingCalendar = ({ uid }: Props) => {
  const [slots, setSlots] = useState<Record<string, string[]>>({})
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const [availability, bookings] = await Promise.all([
        getAvailabilityTemplate(uid),
        getUserBookings(uid),
      ])
      const slotData = generateSlots(availability, bookings)
      setSlots(slotData)
    }
    fetchData()
  }, [uid])

  const today = new Date()
  const next7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(today.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  return (
    <div className="mt-6 p-4 border rounded-xl">
      <h2 className="text-lg font-semibold mb-2">Book a Slot</h2>
      <div className="grid gap-2">
        {next7.map((date) => (
          <div key={date}>
            <p className="font-medium">{date}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {slots[date]?.length ? (
                slots[date].map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedDate(date)
                      setSelectedTime(time)
                    }}
                    className={`px-3 py-1 rounded border ${
                      selectedDate === date && selectedTime === time
                        ? 'bg-black text-white'
                        : 'bg-white'
                    }`}
                  >
                    {time}
                  </button>
                ))
              ) : (
                <span className="text-sm text-gray-500">No slots</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookingCalendar
