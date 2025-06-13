'use client'

import React, { useState } from 'react'
import { format, addDays, startOfWeek, parse } from 'date-fns'

const HOURS = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00']

export function WeeklyCalendarSelector({
  availability,
  onSelect,
  multiSelect = false,
  value,
  id,
}: {
  availability: string[]
  onSelect: (selection: string | string[]) => void
  multiSelect?: boolean
  value?: string | string[]
  id?: string
}) {
  const initial = Array.isArray(value) ? value : value ? [value] : []
  const [selected, setSelected] = useState<string[]>(initial)
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })

  const now = new Date()

  const handleSelect = (datetime: string) => {
    if (multiSelect) {
      setSelected((prev) => {
        const exists = prev.includes(datetime)
        const updated = exists
          ? prev.filter((d) => d !== datetime)
          : [...prev, datetime]
        onSelect(updated)
        return updated
      })
    } else {
      setSelected([datetime])
      onSelect(datetime)
    }
  }

  return (
    <div id={id} className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Choose a time</h2>
      <div className="grid grid-cols-7 gap-2 text-sm">
        {[...Array(7)].map((_, dayIndex) => {
          const date = addDays(start, dayIndex)
          const dateStr = format(date, 'yyyy-MM-dd')

          return (
            <div key={dayIndex} className="border p-2 rounded">
              <div className="font-bold text-center mb-2">{format(date, 'EEE')}</div>
              {HOURS.map((hour) => {
                const datetime = `${dateStr}T${hour}`
                const slotDate = parse(datetime, "yyyy-MM-dd'T'HH:mm", new Date())
                const isAvailable = availability.includes(datetime)
                const isPast = slotDate < now

                return (
                  <button
                    key={hour}
                    onClick={() => handleSelect(datetime)}
                    disabled={!isAvailable || isPast}
                    className={`block w-full text-xs px-2 py-1 mb-1 rounded ${
                      !isAvailable || isPast
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : selected.includes(datetime)
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-black hover:bg-green-100'
                    }`}
                  >
                    {hour}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
