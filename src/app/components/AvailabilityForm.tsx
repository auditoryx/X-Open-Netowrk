'use client';
import { useState, FormEvent } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

interface AvailabilityFormProps {
  userRole: string;
}

export default function AvailabilityForm({ userRole }: AvailabilityFormProps): JSX.Element {
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
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
      alert('Submission failed: ' + (err as Error).message);
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
