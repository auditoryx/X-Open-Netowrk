'use client';

import React from 'react';

type Slot = { day: string; time: string };

type Props = {
  availability: Slot[];
  busySlots: Slot[];
  toggleSlot: (slot: Slot) => void;
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function SlotSelectorGrid({ availability, busySlots, toggleSlot }: Props) {
  const isSelected = (day: string, time: string) =>
    availability.some((slot) => slot.day === day && slot.time === time);

  const isBusy = (day: string, time: string) =>
    busySlots.some((slot) => slot.day === day && slot.time === time);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-center border border-gray-300">
        <thead>
          <tr>
            <th className="p-2 border bg-gray-100">Time</th>
            {days.map((day) => (
              <th key={day} className="p-2 border bg-gray-100">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time) => (
            <tr key={time}>
              <td className="p-2 border bg-gray-50 font-medium">{time}</td>
              {days.map((day) => {
                const selected = isSelected(day, time);
                const busy = isBusy(day, time);
                const baseStyle = "px-2 py-1 border rounded-md cursor-pointer transition";
                const style = busy
                  ? "bg-red-400 text-white cursor-not-allowed opacity-50"
                  : selected
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-gray-300";
                return (
                  <td key={day} className="p-1 border">
                    <button
                      disabled={busy}
                      onClick={() => toggleSlot({ day, time })}
                      className={`${baseStyle} ${style}`}
                    >
                      {selected ? '✔' : ''}
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
