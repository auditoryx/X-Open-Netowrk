'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import BookingConfirmation from '@/components/booking/BookingConfirmation';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const time = searchParams?.get('time') || null;
  const location = searchParams?.get('location') || null;
  const fee = searchParams?.get('fee') || null;
  const providerId = searchParams?.get('providerId') || undefined;
  const bookingId = searchParams?.get('bookingId') || undefined;

  return (
    <BookingConfirmation
      time={time}
      location={location}
      fee={fee}
      providerId={providerId}
      bookingId={bookingId}
    />
  );
}