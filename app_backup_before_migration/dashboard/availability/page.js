'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function AvailabilityPage() {
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/');
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch(`/api/profile/availability?uid=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setLocation(data.location || '');
        setAvailability(data.availability || '');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth(app);
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const res = await fetch('/api/profile/availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ location, availability })
    });

    if (res.ok) {
      alert('Availability saved!');
    } else {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Set Availability</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Location (e.g. Tokyo, Japan)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <textarea
          placeholder="Availability (e.g. Mon–Fri, 10am–6pm)"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          required
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
