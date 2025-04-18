'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function SetRolePage() {
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  const handleSetRole = async () => {
    setStatus('Setting role...');
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      setStatus('Not signed in');
      return;
    }

    const token = await user.getIdToken();

    const res = await fetch('/api/set-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    const data = await res.json();

    if (data.success) {
      setStatus('✅ Role set successfully!');
    } else {
      setStatus(`❌ ${data.error}`);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Set Your Role</h1>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">Select a role</option>
        <option value="artist">Artist</option>
        <option value="producer">Producer</option>
        <option value="engineer">Engineer</option>
        <option value="studio">Studio</option>
        <option value="videographer">Videographer</option>
        <option value="designer">Designer</option>
        <option value="a&r">A&R</option>
      </select>
      <button onClick={handleSetRole} style={{ marginLeft: '1rem' }}>Submit</button>
      <p>{status}</p>
    </div>
  );
}
