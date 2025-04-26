'use client';
import { useState } from 'react';

export default function BookingRequestForm({ service }) {
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipientUid: service.uid,
          role: service.role,
          message,
          timeSlot: 'TBD'
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Booking request sent!');
        setMessage('');
      } else {
        alert(data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong');
    }
  };

  return (
    <div className="mt-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional message..."
        className="w-full p-2 rounded bg-zinc-800 text-white"
      />
      <button
        onClick={handleSubmit}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Request Booking
      </button>
    </div>
  );
}
