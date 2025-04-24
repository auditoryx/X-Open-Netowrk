import { useState } from 'react';
import { createBooking } from '@/lib/firestore/createBooking';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';

export default function BookingForm({ providerId }: { providerId: string }) {
  const [service, setService] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createBooking({
      clientId: user.uid,
      providerId,
      service,
      dateTime,
      message,
    });

    toast.success('Booking request sent!');
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <input
        placeholder='Service'
        value={service}
        onChange={(e) => setService(e.target.value)}
        className='w-full p-2 border rounded'
      />
      <input
        type='datetime-local'
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
        className='w-full p-2 border rounded'
      />
      <textarea
        placeholder='Optional Message'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className='w-full p-2 border rounded'
      />
      <button type='submit' className='bg-black text-white px-4 py-2 rounded'>
        Request Booking
      </button>
    </form>
  );
}
