import { useState } from 'react';

interface Props {
  onChange: (slots: string[]) => void;
}

export default function AvailabilitySelector({ onChange }: Props) {
  const [slots, setSlots] = useState<string[]>([]);

  const toggleSlot = (slot: string) => {
    const updated = slots.includes(slot)
      ? slots.filter((s) => s !== slot)
      : [...slots, slot];
    setSlots(updated);
    onChange(updated);
  };

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['12:00', '14:00', '16:00', '18:00', '20:00'];

  return (
    <div>
      <label className='block mb-2 font-semibold'>Availability</label>
      <div className='grid grid-cols-7 gap-1 text-center text-sm'>
        {weekdays.map((day) =>
          hours.map((hour) => {
            const slot = `${day} ${hour}`;
            const selected = slots.includes(slot);
            return (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                className={`border p-1 rounded ${selected ? 'bg-black text-white' : 'bg-white'}`}
              >
                {slot}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
