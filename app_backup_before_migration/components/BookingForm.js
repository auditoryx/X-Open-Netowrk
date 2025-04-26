'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';

export default function BookingForm({ recipientUid, role }) {
  const [timeSlot, setTimeSlot] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const token = await user.getIdToken();

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientUid,
          role,
          timeSlot,
          message
        })
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeSlot('');
        setMessage('');
      } else {
        throw new Error(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-black">
      <div>
        <label className="block text-sm font-medium">Preferred Time Slot</label>
        <input
          type="text"
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
          placeholder="e.g. May 5th, 3–5pm"
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Optional Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Any specific requests?"
          className="w-full border border-gray-300 rounded px-3 py-2"
          rows={3}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        {loading ? 'Sending...' : 'Send Booking Request'}
      </button>
      {success && <p className="text-green-600">Booking request sent!</p>}
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
