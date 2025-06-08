'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function BookingChatTopBar({
  bookingId,
  initialCount,
  isClient,
}: {
  bookingId: string;
  initialCount: number;
  isClient: boolean;
}) {
  const { userData } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (loading || count <= 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/bookings/request-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        setCount(c => c - 1);
      } else {
        console.error('Revision request failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const isEngineer = userData?.role === 'engineer';

  return (
    <div className="flex items-center justify-between mb-2">
      {isEngineer && (
        <span className="text-xs bg-neutral-700 text-white px-2 py-0.5 rounded">
          Revisions left: {count}
        </span>
      )}
      {isClient && count > 0 && (
        <button
          onClick={handleRequest}
          disabled={loading}
          className="btn btn-primary btn-sm"
        >
          {loading ? 'Requesting…' : 'Request Revision'}
        </button>
      )}
    </div>
  );
}
