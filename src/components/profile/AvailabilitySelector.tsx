'use client'

import React, { useEffect, useState } from 'react'
import { saveAvailabilityTemplate } from '@/lib/firestore/saveAvailabilityTemplate'
import { getAvailabilityTemplate } from '@/lib/firestore/getAvailabilityTemplate'
import { useAuth } from '@/lib/hooks/useAuth'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const AvailabilitySelector = () => {
  const { user } = useAuth()
  const [availability, setAvailability] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      getAvailabilityTemplate(user.uid).then(setAvailability)
    }
  }, [user])

  const handleChange = (day: string, value: string) => {
    setAvailability((prev) => ({ ...prev, [day]: value }))
  }

  const handleSave = async () => {
    if (!user) return
    await saveAvailabilityTemplate(user.uid, availability)
    alert('Availability saved!')
  }

  return (
    <div className="mt-6 p-4 border rounded-xl">
      <h2 className="text-lg font-semibold mb-2">Set Weekly Availability</h2>
      {WEEKDAYS.map((day) => (
        <div key={day} className="flex items-center gap-2 mb-2">
          <label className="w-12">{day}</label>
          <input
            type="text"
            placeholder="e.g. 13:00–18:00"
            value={availability[day] || ''}
            onChange={(e) => handleChange(day, e.target.value)}
            className="border px-2 py-1 rounded w-48"
          />
        </div>
      ))}
      <button onClick={handleSave} className="mt-3 bg-black text-white px-4 py-2 rounded">
        Save
      </button>
    </div>
  )
}

export default AvailabilitySelector
