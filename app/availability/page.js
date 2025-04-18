'use client';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export default function AvailabilityViewer() {
  const [data, setData] = useState([]);
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    const db = getFirestore(app);
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'availability'));
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(docs);

      const groupedByRole = docs.reduce((acc, item) => {
        if (!acc[item.role]) acc[item.role] = [];
        acc[item.role].push(item);
        return acc;
      }, {});
      setGrouped(groupedByRole);
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📅 Creator Availability</h1>
      {Object.entries(grouped).map(([role, entries]) => (
        <div key={role} style={{ marginTop: '2rem' }}>
          <h2>{role.charAt(0).toUpperCase() + role.slice(1)}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {entries.map((entry) => (
              <div key={entry.id} style={{
                border: '1px solid #ccc',
                padding: '1rem',
                borderRadius: '8px',
                width: '250px',
                background: '#f9f9f9'
              }}>
                <strong>{entry.name}</strong><br />
                <small>{entry.email}</small><br />
                <p><strong>Location:</strong> {entry.location || 'N/A'}</p>
                <p><strong>Availability:</strong><br />{entry.availability}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
