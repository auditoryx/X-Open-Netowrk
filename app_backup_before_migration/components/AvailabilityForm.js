'use client';
import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function AvailabilityForm({ userRole }) {
  const [timeSlot, setTimeSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeSlot,
          role: userRole,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Availability submitted!');
        setTimeSlot('');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem', border: '1px solid #ccc', marginTop: '1rem' }}>
      <h3>Add Available Time Slot</h3>
      <input
        type="text"
        value={timeSlot}
        onChange={(e) => setTimeSlot(e.target.value)}
        placeholder="e.g. May 1, 2pm–4pm"
        required
        style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
      />
      <button type="submit" disabled={submitting} style={{ padding: '0.5rem 1rem' }}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
