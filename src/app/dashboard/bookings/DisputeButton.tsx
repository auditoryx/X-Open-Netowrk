'use client';

import { useState } from 'react';

export default function DisputeButton({ bookingId }: { bookingId: string }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const openDispute = async () => {
    setLoading(true);
    const res = await fetch('/api/disputes/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, reason }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
  };

  if (sent) return <p className="text-green-500">Dispute Submitted</p>;

  return (
    <div className="space-y-2">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for dispute"
        className="w-full border p-2 rounded"
      />
      <button
        onClick={openDispute}
        disabled={loading || !reason}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Submitting...' : 'Open Dispute'}
      </button>
    </div>
  );
}
