'use client';

import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function BookingCalendar({ availableDates }: { availableDates: string[] }) {
  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const formattedDate = date.toISOString().split('T')[0];
      return !availableDates.includes(formattedDate);
    }
    return false;
  };

  return (
    <div className="p-4 border rounded">
      <Calendar tileDisabled={tileDisabled} />
    </div>
  );
}
