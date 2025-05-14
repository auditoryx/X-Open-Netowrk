'use client';

import React from 'react';
import { DateTime } from 'luxon';

type Slot = { day: string; time: string };
type Props = { slots: Slot[]; timezone?: string };

export default function AvailabilitySummary({ slots, timezone }: Props) {
  if (!slots.length) {
    return <p className="text-sm text-gray-500">No availability selected.</p>;
  }

  const byDay: Record<string, string[]> = {};
  slots.forEach(({ day, time }) => {
    byDay[day] = byDay[day] || [];
    byDay[day].push(time);
  });

  return (
    <div className="space-y-1">
      <h3 className="font-semibold">Summary</h3>
      {Object.entries(byDay).map(([day, times]) => {
        const formatted = times
          .sort()
          .map((t) => {
            if (!timezone) return t;
            const dt = DateTime.fromFormat(t, 'HH:mm', { zone: timezone });
            return dt
              .setZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
              .toFormat('HH:mm');
          })
          .join(', ');
        return (
          <p key={day} className="text-sm">
            <strong>{day}:</strong> {formatted}
          </p>
        );
      })}
    </div>
  );
}
