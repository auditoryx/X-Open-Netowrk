'use client';

import { useEffect, useState } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '@/app/firebase';
import { useAuth } from '@/lib/hooks/useAuth';

const HOURS = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilitySelector({
  availability,
  setAvailability,
}: {
  availability: string[];
  setAvailability: (a: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(availability || []);
  const { user } = useAuth();

  const toggleSlot = (slot: string) => {
    const newAvailability = selected.includes(slot)
      ? selected.filter((s) => s !== slot)
      : [...selected, slot];

    setSelected(newAvailability);
    setAvailability(newAvailability);

    if (user?.uid) {
      const db = getFirestore(app);
      updateDoc(doc(db, 'users', user.uid), {
        availability: newAvailability,
      });
    }
  };

  useEffect(() => {
    setSelected(availability || []);
  }, [availability]);

  return (
    <div className="space-y-4">
      {DAYS.map((day) => (
        <div key={day}>
          <h3 className="font-bold text-white">{day}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {HOURS.map((hour) => {
              const slot = `${day} ${hour}`;
              const selectedClass = selected.includes(slot)
                ? 'bg-white text-black'
                : 'bg-gray-800 text-white';

              return (
                <button
                  key={slot}
                  onClick={() => toggleSlot(slot)}
                  className={`px-3 py-1 rounded ${selectedClass} hover:opacity-80 border`}
                  type="button"
                >
                  {hour}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
