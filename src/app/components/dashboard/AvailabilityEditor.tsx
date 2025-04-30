'use client';

import React, { useState } from 'react';
import { useAvailability } from '@/lib/hooks/useAvailability';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function AvailabilityEditor() {
  const { availability, saveAvailability, loading } = useAvailability();
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleAddSlot = () => {
    if (!selectedDay || !selectedTime) return;
    const exists = availability.some((slot) => slot.day === selectedDay && slot.time === selectedTime);
    if (!exists) {
      const updated = [...availability, { day: selectedDay, time: selectedTime }];
      saveAvailability(updated);
    }
  };

  const handleRemove = (day: string, time: string) => {
    const updated = availability.filter((slot) => !(slot.day === day && slot.time === time));
    saveAvailability(updated);
  };

  if (loading) return <p>Loading availability...</p>;

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Your Weekly Availability</h2>
      <div className="flex gap-4 mb-2">
        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="border px-3 py-2 rounded-md">
          <option value="">Select Day</option>
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="border px-3 py-2 rounded-md">
          <option value="">Select Time</option>
          {times.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={handleAddSlot} className="bg-black text-white px-4 py-2 rounded-md">Add</button>
      </div>

      <ul className="mt-4 space-y-1">
        {availability.map((slot, i) => (
          <li key={i} className="flex justify-between items-center border px-3 py-1 rounded-md">
            <span>{slot.day} @ {slot.time}</span>
            <button onClick={() => handleRemove(slot.day, slot.time)} className="text-red-500 text-sm">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
