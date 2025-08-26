import React from 'react';

type SplitItem = { party?: string; percent?: number; amount?: number };
type Booking = { revenueSplit?: SplitItem[] | null };

export default function RevenueSplitViewer({ booking }: { booking?: Booking }) {
  const split = booking?.revenueSplit ?? [];
  if (!split || split.length === 0) return <div>No revenue split</div>;
  return (
    <div className="space-y-2">
      {split.map((s, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border p-2">
          <span>{s.party ?? 'Party'}</span>
          <span>{s.percent != null ? `${s.percent}%` : ''}{s.amount != null ? ` · $${s.amount}` : ''}</span>
        </div>
      ))}
    </div>
  );
}

