'use client';
import { useEffect, useState } from 'react';
import type { Room } from '@/types/user';
import { calcQuote } from './calcQuote';

interface Props {
  rooms: Room[];
  onChange?: (amount: number) => void;
}

export default function QuoteCalculator({ rooms, onChange }: Props) {
  const [roomIndex, setRoomIndex] = useState(0);
  const [hours, setHours] = useState(rooms[0]?.minBlock || 1);
  const [withEngineer, setWithEngineer] = useState(false);

  const room = rooms[roomIndex] || rooms[0];

  useEffect(() => {
    if (!room) return;
    setHours(room.minBlock);
    setWithEngineer(false);
  }, [roomIndex]);

  const quote = room ? calcQuote(room, hours, withEngineer) : 0;

  useEffect(() => {
    onChange && onChange(quote);
  }, [quote, onChange]);

  if (!room) return null;

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="room" className="text-sm font-medium block mb-1">Room</label>
        <select
          id="room"
          className="input-base"
          value={roomIndex}
          onChange={(e) => setRoomIndex(Number(e.target.value))}
        >
          {rooms.map((r, i) => (
            <option key={i} value={i}>
              {r.name} (${r.hourlyRate}/hr)
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="hours" className="text-sm font-medium block mb-1">Hours</label>
        <input
          id="hours"
          type="number"
          className="input-base"
          step={room.minBlock}
          min={room.minBlock}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
        />
      </div>
      {room.hasEngineer && (
        <label htmlFor="with-engineer" className="flex items-center gap-2">
          <input
            id="with-engineer"
            type="checkbox"
            className="w-4 h-4"
            checked={withEngineer}
            onChange={(e) => setWithEngineer(e.target.checked)}
          />
          Add engineer (+${room.engineerFee})
        </label>
      )}
      <p className="font-semibold">Total: ${quote}</p>
    </div>
  );
}
