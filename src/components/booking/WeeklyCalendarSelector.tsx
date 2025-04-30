'use client';

import React, { useState } from 'react';

const HOURS = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function WeeklyCalendarSelector({
  availability,
  onSelect,
}: {
  availability: string[];
  onSelect: (datetime: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (slot: string) => {
    setSelected(slot);
    onSelect(slot);
  };

  return (
    <div className="space-y-4">
      {DAYS.map((day) => (
        <div key={day}>
          <h3 className="text-lg font-semibold text-white mb-1">{day}</h3>
          <div className="flex flex-wrap gap-2">
            {HOURS.map((hour) => {
              const slot = `${day} ${hour}`;
              const isAvailable = availability.includes(slot);
              const isSelected = selected === slot;

              return (
                <button
                  key={slot}
                  disabled={!isAvailable}
                  onClick={() => handleSelect(slot)}
                  className={`px-3 py-1 rounded border text-sm transition
                    ${!isAvailable
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : isSelected
                      ? 'bg-white text-black border-white'
                      : 'bg-gray-900 text-white hover:bg-white hover:text-black'}
                  `}
                >
                  {hour}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
