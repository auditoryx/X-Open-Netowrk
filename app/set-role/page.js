<<<<<<< HEAD
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
=======
"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function SetRolePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  const assignRole = async (role) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { role }, { merge: true });
    router.push(`/dashboard/${role}`);
  };

  if (!user) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="p-10 text-white space-y-4">
      <h1 className="text-2xl font-bold">Choose Your Role</h1>
      <div className="flex gap-4 flex-wrap">
        {["artist", "engineer", "producer", "videographer", "studio"].map((r) => (
          <button
            key={r}
            className="btn btn-primary"
            onClick={() => assignRole(r)}
          >
            I am a {r}
          </button>
        ))}
      </div>
>>>>>>> 3126253 (chore: finalize migration prep for rebase)
    </div>
  );
}
