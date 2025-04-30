'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { parseISO, format } from 'date-fns';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const time = searchParams?.get('time') || null;
  const location = searchParams?.get('location') || null;
  const router = useRouter();

  const serviceTitle = 'AuditoryX Booking';

  let formatted = null;
  let gCalStart = null;
  if (time) {
    try {
      const parsed = parseISO(time);
      formatted = format(parsed, 'EEEE, MMMM d @ h:mm a');
      gCalStart = time.replace(/[-:]/g, '').replace('T', '');
    } catch {
      formatted = time;
    }
  }

  const calendarUrl = time
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        serviceTitle
      )}&dates=${gCalStart}/${gCalStart}&details=Your booking with AuditoryX`
    : null;

  const generateICS = () => {
    if (!time) return;
    const blob = new Blob(
      [
        `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${serviceTitle}
DTSTART:${gCalStart}
DTEND:${gCalStart}
DESCRIPTION=Booking via AuditoryX
END:VEVENT
END:VCALENDAR`,
      ],
      { type: 'text/calendar' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'booking.ics';
    link.click();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">✅ Booking Request Sent!</h1>
        <p className="text-lg mb-2">
          {formatted ? (
            <>Your request is locked in for <span className="font-semibold text-green-400">{formatted}</span>.</>
          ) : (
            <>Your request has been submitted.</>
          )}
        </p>
        {location && (
          <p className="text-sm text-gray-400 mb-2">📍 Location: {location}</p>
        )}
        <p className="text-sm text-gray-500 mb-8">You’ll receive a confirmation email shortly.</p>

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
  );
}
