'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-ebony text-gray-100 flex items-center justify-center p-4">
      <div className="bg-panel rounded-xl p-8 max-w-md w-full text-center border border-neutral-700">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-4 text-white">
          Booking Request Sent!
        </h1>
        <p className="text-gray-400 mb-6">
          Your request has been submitted successfully. You'll receive a confirmation email shortly.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard/bookings')}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
          >
            View My Bookings
          </button>
          
          <button
            onClick={() => router.push('/explore')}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-white py-3 px-4 rounded-lg transition-colors"
          >
            Explore More Creators
          </button>
        </div>
      </div>
    </div>
  );
}