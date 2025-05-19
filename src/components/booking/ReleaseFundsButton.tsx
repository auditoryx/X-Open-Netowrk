'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  bookingId: string;
};

export default function ReleaseFundsButton({ bookingId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleClick = async () => {
    if (status !== 'idle') return;

    setStatus('loading');

    try {
      const res = await fetch('/api/capture-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      if (res.ok) {
        setStatus('done');
        toast.success('Funds released successfully.');
      } else {
        throw new Error('API returned failure');
      }
    } catch (err) {
      console.error('Release error:', err);
      setStatus('error');
      toast.error('Failed to release funds.');
    }
  };

  const label =
    status === 'loading'
      ? 'Releasing...'
      : status === 'done'
      ? 'Funds Released'
      : status === 'error'
      ? 'Error – Retry?'
      : 'Release Funds';

  const bgColor =
    status === 'done'
      ? 'bg-green-600'
      : status === 'error'
      ? 'bg-red-600'
      : 'bg-blue-600';

  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading' || status === 'done'}
      aria-label="Release funds to provider"
      className={`px-4 py-2 rounded text-white font-medium transition ${bgColor} ${
        status !== 'done' ? 'hover:opacity-90' : 'cursor-not-allowed'
      }`}
    >
      {label}
    </button>
  );
}
//       }`}
//       `}
//       >
//         {loading ? 'Submitting...' : 'Submit Dispute'}
//       </button>
//     </div>
//   );
//   );