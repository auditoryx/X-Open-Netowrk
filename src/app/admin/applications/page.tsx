'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      const res = await fetch('/api/applications'); // your existing applications route
      const data = await res.json();
      setApps(data);
      setLoading(false);
    };
    fetchApps();
  }, []);

  const handleApprove = async (uid: string, role: string) => {
    await fetch('/api/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, role }),
    });
    setApps(prev => prev.filter(a => a.userId !== uid));
  };

  const handleBan = async (uid: string) => {
    await fetch('/api/users/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    });
    setApps(prev => prev.filter(a => a.userId !== uid));
  };

  if (loading) return <div className="p-6 text-white">Loading applications...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">User Applications</h1>
        <ul className="space-y-4">
          {apps.map(app => (
            <li key={app.id} className="border border-white p-4 rounded flex justify-between items-center">
              <div>
                <p><strong>User:</strong> {app.userId}</p>
                <p><strong>Role:</strong> {app.role}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleApprove(app.userId, app.role)}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBan(app.userId)}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                >
                  Ban
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
