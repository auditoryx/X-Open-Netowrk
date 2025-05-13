'use client';

import React from 'react';
import { DateTime } from 'luxon';

type Slot = { day: string; time: string };

type Props = {
  availability: Slot[];
  busySlots?: Slot[];
  toggleSlot: (slot: Slot) => void;
  originalTimezone?: string; // 🕓 Creator's saved timezone
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

function convertTime(day: string, time: string, fromTZ: string): string {
  try {
    const now = DateTime.local();
    const target = now.set({ weekday: days.indexOf(day) + 1 })
      .setZone(fromTZ)
      .set({
        hour: parseInt(time.split(':')[0]),
        minute: parseInt(time.split(':')[1]),
      });

    const local = target.setZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    return local.toFormat('HH:mm');
  } catch {
    return time;
  }
}

export default function SlotSelectorGrid({
  availability,
  busySlots = [],
  toggleSlot,
  originalTimezone,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="p-2 border">Time</th>
            {days.map((day) => (
              <th key={day} className="p-2 border">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time) => (
            <tr key={time}>
              <td className="p-2 border font-semibold">{time}</td>
              {days.map((day) => {
                const isSelected = availability.some((s) => s.day === day && s.time === time);
                const isBusy = busySlots.some((s) => s.day === day && s.time === time);
                const baseClass = 'p-2 border text-center rounded-md text-sm font-medium';
                const selectedClass = 'bg-green-500 text-white';
                const busyClass = 'bg-red-300 text-white cursor-not-allowed';
                const emptyClass = 'bg-gray-100 text-black hover:bg-gray-200 cursor-pointer';

                const displayTime = originalTimezone
                  ? convertTime(day, time, originalTimezone)
                  : time;

                return (
                  <td key={day + time}>
                    <button
                      disabled={isBusy}
                      onClick={() => toggleSlot({ day, time })}
                      className={`${baseClass} ${isBusy ? busyClass : isSelected ? selectedClass : emptyClass}`}
                    >
                      {isBusy ? 'Busy' : isSelected ? `✔ ${displayTime}` : displayTime}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
