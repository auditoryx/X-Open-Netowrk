'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const time = searchParams ? searchParams.get('time') : null
  const router = useRouter()

  const serviceTitle = 'AuditoryX Booking'
  const calendarUrl = time
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        serviceTitle
      )}&dates=${time.replace(/[-:]/g, '').replace('T', '/')}/${time
        .replace(/[-:]/g, '')
        .replace('T', '/')}&details=Your booking with AuditoryX`
    : null

  const generateICS = () => {
    if (!time) return
    const blob = new Blob(
      [
        `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${serviceTitle}
DTSTART:${time.replace(/[-:]/g, '')}
DTEND:${time.replace(/[-:]/g, '')}
DESCRIPTION=Booking via AuditoryX
END:VEVENT
END:VCALENDAR`,
      ],
      { type: 'text/calendar' }
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'booking.ics'
    link.click()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">✅ Booking Request Sent!</h1>
        <p className="text-lg mb-4">
          {time ? (
            <>
              We’ve recorded your booking for{' '}
              <span className="font-semibold text-green-400">{time}</span>.
            </>
          ) : (
            <>Your request has been submitted.</>
          )}
        </p>
        <p className="text-sm text-gray-400 mb-8">We’ll notify you once it’s confirmed.</p>

        <div className="flex flex-col gap-2 items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="border border-white px-4 py-2 rounded hover:bg-white hover:text-black"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push('/explore')}
            className="text-sm underline text-gray-300 hover:text-white"
          >
            Explore More Creators
          </button>
        </div>

        {time && (
          <div className="mt-6 space-y-2">
            <button
              onClick={generateICS}
              className="text-sm underline text-green-300 hover:text-white"
            >
              📅 Add to Apple / Outlook Calendar (.ics)
            </button>

            <a
              href={calendarUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline text-blue-400 hover:text-white"
            >
              📆 Add to Google Calendar
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
