'use client';

import React from 'react';
import { useAvailability } from '@/lib/hooks/useAvailability';
import { signIn, getSession } from 'next-auth/react';
import SlotSelectorGrid from './SlotSelectorGrid';
import toast from 'react-hot-toast';

export default function AvailabilityEditor() {
  const {
    availability,
    busySlots,
    saveAvailability,
    loading,
    notes,
    setNotes,
    timezone,
    setTimezone,
    lastSynced,
  } = useAvailability();

  const toggleSlot = (slot: { day: string; time: string }) => {
    const exists = availability.some((s) => s.day === slot.day && s.time === slot.time);
    const updated = exists
      ? availability.filter((s) => !(s.day === slot.day && s.time === slot.time))
      : [...availability, slot];
    saveAvailability(updated, notes, timezone);
  };

  const handleSaveMeta = () => {
    saveAvailability(availability, notes, timezone);
    toast.success('Notes saved');
  };

  const handleSyncFromGoogle = async () => {
    const res = await fetch('/api/calendar/sync');
    if (res.ok) {
      toast.success('Synced availability from Google Calendar!');
    } else {
      toast.error('Failed to sync from Google Calendar');
    }
  };

  const handlePushToGoogle = async () => {
    const session = await getSession();
    const token = session?.accessToken;

    if (!token) {
      toast.error('You must sign in with Google first.');
      return signIn('google');
    }

    const res = await fetch('/api/calendar/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (res.ok) {
      toast.success('Pushed availability to Google Calendar!');
    } else {
      toast.error('Failed to push to Google Calendar');
    }
  };

  if (loading) return <p>Loading availability...</p>;

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-6 text-black">
      <h2 className="text-xl font-bold">Your Weekly Availability</h2>

      {lastSynced && (
        <p className="text-sm text-gray-500">
          Last synced: {new Date(lastSynced).toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })}
        </p>
      )}

      <SlotSelectorGrid
        availability={availability}
        busySlots={busySlots}
        toggleSlot={toggleSlot}
      />

      <div className="space-y-2">
        <input
          type="text"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="Timezone (e.g. JST, EST)"
          className="w-full border px-3 py-2 rounded-md"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Availability notes (e.g. Weekdays only, M–F)"
          className="w-full border px-3 py-2 rounded-md"
        />
        <button onClick={handleSaveMeta} className="bg-blue-600 text-white px-4 py-2 rounded-md">
          Save Notes
        </button>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSyncFromGoogle}
          className="bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Sync from Google Calendar
        </button>
        <button
          onClick={handlePushToGoogle}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Push to Google Calendar
        </button>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { useAvailability } from '@/lib/hooks/useAvailability';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function AvailabilityEditor() {
  const {
    availability,
    saveAvailability,
    loading,
    notes,
    setNotes,
    timezone,
    setTimezone,
  } = useAvailability();

  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleAddSlot = () => {
    if (!selectedDay || !selectedTime) return;
    const exists = availability.some((slot) => slot.day === selectedDay && slot.time === selectedTime);
    if (!exists) {
      const updated = [...availability, { day: selectedDay, time: selectedTime }];
      saveAvailability(updated, notes, timezone);
    }
  };

  const handleRemove = (day: string, time: string) => {
    const updated = availability.filter((slot) => !(slot.day === day && slot.time === time));
    saveAvailability(updated, notes, timezone);
  };

  const handleSaveMeta = () => {
    saveAvailability(availability, notes, timezone);
  };

  if (loading) return <p>Loading availability...</p>;

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold">Your Weekly Availability</h2>

      <div className="flex gap-4">
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

      <ul className="space-y-1">
        {availability.map((slot, i) => (
          <li key={i} className="flex justify-between items-center border px-3 py-1 rounded-md">
            <span>{slot.day} @ {slot.time}</span>
            <button onClick={() => handleRemove(slot.day, slot.time)} className="text-red-500 text-sm">Remove</button>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <input
          type="text"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="Timezone (e.g. JST, EST)"
          className="w-full border px-3 py-2 rounded-md"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Availability notes (e.g. Weekdays only, M-F)"
          className="w-full border px-3 py-2 rounded-md"
        />
        <button onClick={handleSaveMeta} className="bg-blue-600 text-white px-4 py-2 rounded-md">Save Notes</button>
      </div>
    </div>
  );
}
