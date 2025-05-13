'use client';

import React from 'react';

type Slot = { day: string; time: string };
type Props = {
  availability: Slot[];
  busySlots?: Slot[];
  toggleSlot: (slot: Slot) => void;
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function SlotSelectorGrid({ availability, busySlots = [], toggleSlot }: Props) {
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

                return (
                  <td key={day + time}>
                    <button
                      disabled={isBusy}
                      onClick={() => toggleSlot({ day, time })}
                      className={`${baseClass} ${isBusy ? busyClass : isSelected ? selectedClass : emptyClass}`}
                    >
                      {isBusy ? 'Busy' : isSelected ? '✓' : ''}
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
