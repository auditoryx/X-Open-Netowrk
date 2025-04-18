'use client';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function VideographerDashboard() {
  const [slot, setSlot] = useState('');
  const [videographerId, setVideographerId] = useState('');
  const [availability, setAvailability] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/videographer-availability')
      .then(res => res.json())
      .then(data => setAvailability(data.slots));
  }, []);

  const submitAvailability = async () => {
    if (!slot || !videographerId) return alert('Fill out both fields');
    setSubmitting(true);
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const res = await fetch('/api/videographer-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ timeSlot: slot, videographerId })
      });

      const result = await res.json();
      if (result.success) {
        alert('Slot added!');
        setSlot('');
        setVideographerId('');
        const updated = await fetch('/api/videographer-availability').then(res => res.json());
        setAvailability(updated.slots);
      } else {
        alert('Failed to submit slot.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Videographer Dashboard</h1>
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Videographer ID"
          className="w-full p-2 rounded text-black"
          value={videographerId}
          onChange={(e) => setVideographerId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Time Slot (e.g., April 22nd, 1–4PM)"
          className="w-full p-2 rounded text-black"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
        />
        <button
          onClick={submitAvailability}
          disabled={submitting}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          {submitting ? 'Submitting...' : 'Add Availability'}
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-2">All Available Slots</h2>
      <ul className="space-y-2">
        {availability.map((item) => (
          <li key={item.id} className="bg-gray-800 p-3 rounded">
            <strong>{item.videographerId}</strong>: {item.timeSlot}
          </li>
        ))}
      </ul>
    </div>
  );
}
