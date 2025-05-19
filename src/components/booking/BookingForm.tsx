'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

type BookingFormProps = {
  onBook: (details: { message: string }) => Promise<void> | void;
};

export default function BookingForm({ onBook }: BookingFormProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();

    if (!trimmed || loading) return;

    setLoading(true);
    try {
      await onBook({ message: trimmed });
      toast.success('Booking request sent!');
      setMessage('');
    } catch (err) {
      console.error('Booking submission failed:', err);
      toast.error('Failed to send booking request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 border rounded bg-white text-black"
    >
      <label htmlFor="booking-message" className="text-sm font-medium">
        Message to provider
      </label>
      <textarea
        id="booking-message"
        aria-label="Booking message"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value.replace(/\s{2,}/g, ' '))}
        className="p-2 border rounded resize-none h-32"
        maxLength={500}
        disabled={loading}
      />
      <div className="text-xs text-right text-gray-500">{message.length}/500</div>
      <button
        type="submit"
        aria-label="Send booking request"
        disabled={loading || !message.trim()}
        className={`px-4 py-2 rounded text-white font-medium transition ${
          loading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-black hover:bg-white hover:text-black border border-black'
        }`}
      >
        {loading ? 'Sending…' : 'Send Booking Request'}
      </button>
    </form>
  );
}
// Usage example
// <BookingForm
//   onBook={async ({ message }) => {
//     // Call your booking API or function here
//     await initiateBookingWithStripe({ message });
//   }}
// />