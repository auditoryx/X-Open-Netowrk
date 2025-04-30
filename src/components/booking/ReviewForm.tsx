'use client';

import { useState } from 'react';

export default function ReviewForm({ bookingId }: { bookingId: string }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, text, rating }),
    });

    if (res.ok) {
      setStatus('done');
    } else {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return <p className="text-green-500">Review submitted!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded">
      <textarea
        placeholder="Leave a review..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="p-2 border rounded"
      />
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="p-2 border rounded"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>{n} Stars</option>
        ))}
      </select>
      <button type="submit" disabled={status === 'submitting'} className="bg-black text-white px-4 py-2 rounded">
        {status === 'submitting' ? 'Submitting...' : 'Submit Review'}
      </button>
      {status === 'error' && <p className="text-red-500">Failed to submit review.</p>}
    </form>
  );
}
