'use client';

import { useState } from 'react';
import { createDispute } from '@/lib/firestore/disputes/createDispute';

export default function DisputeForm({ bookingId, uid }: { bookingId: string; uid: string }) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    await createDispute({ bookingId, fromUser: uid, reason });
    setSubmitted(true);
  };

  if (submitted) {
    return <p className="text-green-600">Dispute submitted. Admin will review it shortly.</p>;
  }

  return (
    <div className="space-y-2">
      <textarea
        placeholder="Explain your reason for dispute"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleSubmit}
        className="bg-red-600 text-white px-4 py-2 rounded hover:opacity-90"
        disabled={!reason}
      >
        Submit Dispute
      </button>
    </div>
  );
}
