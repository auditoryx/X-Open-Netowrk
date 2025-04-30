'use client'

import { useState } from 'react';

export default function AvailabilitySelector({ availability, setAvailability }: { availability: string[], setAvailability: (a: string[]) => void }) {
  const [day, setDay] = useState('');

  const addDay = () => {
    if (day && !availability.includes(day)) {
      setAvailability([...availability, day]);
      setDay('');
    }
  };

  const removeDay = (d: string) => {
    setAvailability(availability.filter((a) => a !== d));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={day}
          onChange={(e) => setDay(e.target.value)}
          placeholder="Enter available day (e.g., Monday)"
          className="border p-2 rounded w-full"
        />
        <button type="button" onClick={addDay} className="bg-black text-white px-4 rounded">
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {availability.map((d) => (
          <div key={d} className="flex items-center gap-1 bg-gray-200 text-black px-2 py-1 rounded">
            {d}
            <button type="button" onClick={() => removeDay(d)} className="text-red-500">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
