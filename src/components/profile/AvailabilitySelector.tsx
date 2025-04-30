'use client';

import { useEffect, useState } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '@/app/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { format, addDays, startOfWeek } from 'date-fns';

const HOURS = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

export default function AvailabilitySelector({
  availability,
  setAvailability,
}: {
  availability: string[];
  setAvailability: (a: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(availability || []);
  const { user } = useAuth();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday

  const toggleSlot = async (slot: string) => {
    const updated = selected.includes(slot)
      ? selected.filter((s) => s !== slot)
      : [...selected, slot];

    setSelected(updated);
    setAvailability(updated);

    if (user?.uid) {
      const db = getFirestore(app);
      await updateDoc(doc(db, 'users', user.uid), {
        availability: updated,
      });
    }
  };

  useEffect(() => {
    setSelected(availability || []);
  }, [availability]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Set Your Weekly Availability</h2>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(7)].map((_, dayIdx) => {
          const date = addDays(weekStart, dayIdx);
          const dateStr = format(date, 'yyyy-MM-dd');

          return (
            <div key={dayIdx} className="border p-2 rounded">
              <p className="text-sm font-bold text-center text-white mb-2">{format(date, 'EEE')}</p>
              {HOURS.map((hour) => {
                const datetime = `${dateStr}T${hour}`;
                const isActive = selected.includes(datetime);
                return (
                  <button
                    key={hour}
                    onClick={() => toggleSlot(datetime)}
                    className={`w-full py-1 text-xs rounded ${
                      isActive
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-black hover:bg-gray-100'
                    } mb-1`}
                    type="button"
                  >
                    {hour}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
