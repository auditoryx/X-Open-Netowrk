'use client';

import { useState } from 'react';
import SlotSelectorGrid from '@/app/components/dashboard/SlotSelectorGrid';
import { withRoleProtection } from '@/lib/utils/withRoleProtection';
import { parseAvailability } from '@/lib/csv/parseAvailability';

type Slot = { day: string; time: string };

function Page() {
  const [rooms, setRooms] = useState<Record<string, Slot[]>>({});

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const slots = parseAvailability(text);
    const grouped: Record<string, Slot[]> = {};
    slots.forEach((s) => {
      const day = new Date(s.dateISO).toLocaleDateString('en-US', { weekday: 'long' });
      const slot = { day, time: s.startTime };
      grouped[s.roomId] = grouped[s.roomId] ? [...grouped[s.roomId], slot] : [slot];
    });
    setRooms(grouped);
    await fetch('/api/availability/import', { method: 'POST', headers: { 'Content-Type': 'text/csv' }, body: text });
  };

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-xl font-bold">Studio Availability</h1>
      <div className="space-x-4">
        <input id="csv-upload" type="file" accept=".csv" onChange={handleImport} className="hidden" />
        <label htmlFor="csv-upload" className="btn">Import CSV</label>
        <a href="/sample-availability.csv" className="underline text-sm">Download sample</a>
      </div>
      {Object.entries(rooms).map(([roomId, slots]) => (
        <div key={roomId} className="space-y-2">
          <h2 className="font-semibold text-lg">Room {roomId}</h2>
          <SlotSelectorGrid availability={slots} toggleSlot={() => {}} />
        </div>
      ))}
    </div>
  );
}

export default withRoleProtection(Page, ['studio']);
