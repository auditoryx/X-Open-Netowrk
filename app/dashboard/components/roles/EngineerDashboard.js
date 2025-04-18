'use client';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function EngineerDashboard() {
  const [service, setService] = useState('');
  const [description, setDescription] = useState('');
  const [engineerId, setEngineerId] = useState('');
  const [services, setServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/engineer-services')
      .then(res => res.json())
      .then(data => setServices(data.services));
  }, []);

  const submitService = async () => {
    if (!service || !description || !engineerId) return alert('Fill out all fields');
    setSubmitting(true);
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const res = await fetch('/api/engineer-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ engineerId, service, description })
      });

      const result = await res.json();
      if (result.success) {
        alert('Service added!');
        setService('');
        setDescription('');
        setEngineerId('');
        const updated = await fetch('/api/engineer-services').then(res => res.json());
        setServices(updated.services);
      } else {
        alert('Failed to add service.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Engineer Dashboard</h1>
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Engineer ID"
          className="w-full p-2 rounded text-black"
          value={engineerId}
          onChange={(e) => setEngineerId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Service Name (e.g., Mixing)"
          className="w-full p-2 rounded text-black"
          value={service}
          onChange={(e) => setService(e.target.value)}
        />
        <textarea
          placeholder="Short description"
          className="w-full p-2 rounded text-black"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          onClick={submitService}
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {submitting ? 'Submitting...' : 'Add Service'}
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-2">Your Services</h2>
      <ul className="space-y-2">
        {services.map((s) => (
          <li key={s.id} className="bg-gray-800 p-3 rounded">
            <strong>{s.service}</strong>: {s.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
