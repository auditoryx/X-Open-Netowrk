'use client';

import { useState } from 'react';

export default function ReleaseFundsButton({ bookingId }: { bookingId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleClick = async () => {
    setStatus('loading');
    const res = await fetch('/api/capture-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });

    if (res.ok) {
      setStatus('done');
    } else {
      setStatus('error');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={status !== 'idle'}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      {status === 'loading'
        ? 'Releasing...'
        : status === 'done'
        ? 'Funds Released'
        : status === 'error'
        ? 'Error'
        : 'Release Funds'}
    </button>
  );
}
