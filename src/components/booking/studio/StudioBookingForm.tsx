'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';
import WeeklyCalendarSelector from '../WeeklyCalendarSelector';
import QuoteCalculator from './QuoteCalculator';
import { createBooking } from '@lib/firestore/createBooking';
import { checkBookingConflict } from '@/lib/firestore/checkBookingConflict';
import { useProviderAvailability } from '@/lib/hooks/useProviderAvailability';
import { getNextDateForWeekday } from '@/lib/google/utils';
import type { Room } from '@/types/user';

interface Props {
  providerId: string;
  rooms: Room[];
  onBooked?: () => void;
}

export default function StudioBookingForm({ providerId, rooms, onBooked }: Props) {
  const { user } = useAuth();
  const { slots, busySlots, timezone } = useProviderAvailability(providerId);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [quote, setQuote] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="p-4 border rounded bg-white text-black space-y-2">
        <p>Please log in to request a booking.</p>
        <a href="/login" className="btn btn-primary">Login</a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();

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
        service: 'studio',
        dateTime: selectedTime,
        message: trimmed,
        quote,
      });
      toast.success('Booking request sent!');
      setMessage('');
      setSelectedTime(null);
      if (onBooked) {
        onBooked();
      }
    } catch (err) {
      console.error('Booking submission failed:', err);
      toast.error('Failed to send booking request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded bg-white text-black">
      <QuoteCalculator rooms={rooms} onChange={setQuote} />
      <WeeklyCalendarSelector
        availability={slots
          .map((s) => `${getNextDateForWeekday(s.day as any)}T${s.time}`)
          .filter(
            (dt) => !busySlots.some((b) => `${getNextDateForWeekday(b.day as any)}T${b.time}` === dt)
          )}
        onSelect={(dt) => setSelectedTime(dt as string)}
      />
      <p className="text-xs text-gray-600">Provider timezone: {timezone || 'N/A'}</p>
      <label htmlFor="booking-message" className="text-sm font-medium">Message to provider</label>
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
        {loading ? 'Sending…' : `Send Booking Request ($${quote})`}
      </button>
    </form>
  );
}
