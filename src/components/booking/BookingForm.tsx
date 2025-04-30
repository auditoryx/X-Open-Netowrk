'use client';

import { useState } from 'react';

export default function BookingForm({ onBook }: { onBook: (details: any) => void }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onBook({ message });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded">
      <textarea
        placeholder="Message to provider..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="p-2 border rounded"
      />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">
        Send Booking Request
      </button>
    </form>
  );
}
