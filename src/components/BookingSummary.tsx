import React from 'react';
import { generateContract, BookingType } from '@/lib/pdf/generateContract';

interface BookingSummaryProps {
  bookingData: BookingType;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ bookingData }) => {
  return (
    <div className="booking-summary">
      <h2>Booking Summary</h2>
      <p><strong>Client:</strong> {bookingData.clientName}</p>
      <p><strong>Provider:</strong> {bookingData.providerName}</p>
      <p><strong>Service:</strong> {bookingData.serviceTitle}</p>
      <p><strong>Amount:</strong> ${bookingData.price.toFixed(2)}</p>
      <p><strong>Date:</strong> {bookingData.bookingDate}</p>
      <p><strong>Stripe Session ID:</strong> {bookingData.stripeSessionId}</p>
      <button
        className="btn btn-primary mt-4 px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
        onClick={() => generateContract(bookingData)}
      >
        Download Contract
      </button>
    </div>
  );
};

export default BookingSummary;
