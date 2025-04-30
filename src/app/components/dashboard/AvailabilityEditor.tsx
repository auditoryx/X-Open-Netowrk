'use client';

import React from 'react';
import { useAvailability } from '@/lib/hooks/useAvailability';

const timeOptions = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00',
];

export default function AvailabilityEditor() {
  const { availability, saveAvailability, loading } = useAvailability();

  const toggleSlot = (time: string) => {
    const updated = availability.includes(time)
      ? availability.filter((t) => t !== time)
      : [...availability, time];
    saveAvailability(updated);
  };

  if (loading) return <p>Loading availability...</p>;

  return (
    <div className="p-4 rounded-xl shadow-md bg-white">
      <h2 className="text-xl font-bold mb-4">Your Weekly Availability</h2>
      <div className="grid grid-cols-4 gap-2">
        {timeOptions.map((time) => (
          <button
            key={time}
            onClick={() => toggleSlot(time)}
            className={`px-3 py-2 rounded-md border ${
              availability.includes(time)
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-black'
            }`}
          >
            {time}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-4">
        Click to toggle available time slots. Times are saved automatically.
      </p>
    </div>
  );
}
