'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import BookingConfirmation from '@/components/booking/BookingConfirmation';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const time = searchParams?.get(SCHEMA_FIELDS.BOOKING_REQUEST.TIME) || null;
  const location = searchParams?.get('location') || null;
  const fee = searchParams?.get('fee') || null;
  const providerId = searchParams?.get(SCHEMA_FIELDS.BOOKING.PROVIDER_ID) || undefined;
  const bookingId = searchParams?.get(SCHEMA_FIELDS.REVIEW.BOOKING_ID) || undefined;

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