'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function RoleSwitcher() {
  const [roles, setRoles] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRoles = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore(app);
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        const userRoles = data.roles || [];
        const currentRole = data.role || null;
        setRoles(userRoles);
        setCurrent(currentRole);
      }
    };
    fetchRoles();
  }, []);

  const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setCurrent(newRole);
    router.push(`/dashboard/${newRole}`);
  };

  if (!current || roles.length <= 1) return null;

  return (
    <div className="mb-4">
      <label htmlFor="role-switcher" className="text-sm mr-2">Current Role:</label>
      <select
        id="role-switcher"
        value={current}
        onChange={handleSwitch}
        className="bg-neutral-800 border border-neutral-700 px-2 py-1 rounded text-white text-sm"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
