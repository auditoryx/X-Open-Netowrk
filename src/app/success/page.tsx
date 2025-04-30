'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const time = searchParams ? searchParams.get('time') : null
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">✅ Booking Request Sent!</h1>
        <p className="text-lg mb-4">
          {time ? (
            <>We’ve recorded your booking for <span className="font-semibold text-green-400">{time}</span>.</>
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
      </div>
    </div>
  )
}
