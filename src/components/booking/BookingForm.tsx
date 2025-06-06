'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';
import WeeklyCalendarSelector from './WeeklyCalendarSelector';
import { createBooking } from '@lib/firestore/createBooking';
import { checkBookingConflict } from '@/lib/firestore/checkBookingConflict';
import { useProviderAvailability } from '@/lib/hooks/useProviderAvailability';
import { getNextDateForWeekday } from '@/lib/google/calendar';

type BookingFormProps = {
  providerId: string;
  onBooked?: () => void;
};

export default function BookingForm({ providerId, onBooked }: BookingFormProps) {
  const { user } = useAuth();
  const { slots, busySlots, timezone } = useProviderAvailability(providerId);
  const [service, setService] = useState('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();

    if (!user) {
      toast.error('Please log in to send a booking request.');
      return;
    }

    if (!selectedTime) {
      toast.error('Please select a time slot.');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const conflict = await checkBookingConflict(providerId, selectedTime);
      if (conflict) {
        toast.error('Time slot already booked');
        setLoading(false);
        return;
      }
      await createBooking({
        clientId: user.uid,
        providerId,
        service,
        dateTime: selectedTime,
        message: trimmed,
      });
      toast.success('Booking request sent!');
      setMessage('');
      setService('');
      setSelectedTime(null);
      onBooked && onBooked();
    } catch (err) {
      console.error('Booking submission failed:', err);
      toast.error('Failed to send booking request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 border rounded bg-white text-black"
    >
      <input
        type="text"
        placeholder="Service name"
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="input-base"
        required
      />

      <WeeklyCalendarSelector
        availability={slots
          .map((s) => `${getNextDateForWeekday(s.day as any)}T${s.time}`)
          .filter(
            (dt) =>
              !busySlots.some(
                (b) => `${getNextDateForWeekday(b.day as any)}T${b.time}` === dt
              )
          )}
        onSelect={(dt) => setSelectedTime(dt)}
      />

      <p className="text-xs text-gray-600">Provider timezone: {timezone || 'N/A'}</p>

      <label htmlFor="booking-message" className="text-sm font-medium">
        Message to provider
      </label>
      <textarea
        id="booking-message"
        aria-label="Booking message"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value.replace(/\s{2,}/g, ' '))}
        className="textarea-base"
        maxLength={500}
        disabled={loading}
      />
      <div className="text-xs text-right text-gray-500">{message.length}/500</div>
      <button
        type="submit"
        aria-label="Send booking request"
        disabled={loading || !message.trim() || !selectedTime}
        className="btn btn-primary"
      >
        {loading ? 'Sending…' : 'Send Booking Request'}
      </button>
    </form>
  );
}
