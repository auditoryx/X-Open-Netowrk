'use client';

import React from 'react';
import { useAvailability } from '@/lib/hooks/useAvailability';
import { signIn, getSession } from 'next-auth/react';
import SlotSelectorGrid from './SlotSelectorGrid';
import SyncStatusBadge from './SyncStatusBadge';
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
    const exists = availability.some(
      (s) => s.day === slot.day && s.time === slot.time
    );
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
      toast.success('Synced from Google Calendar!');
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

      <SyncStatusBadge lastSynced={lastSynced} />

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
        <button
          onClick={handleSaveMeta}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
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
