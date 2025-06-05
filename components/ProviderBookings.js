"use client";
import { useEffect, useState } from "react";

export default function ProviderBookings() {
  const [incoming, setIncoming] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/bookings');
        if (!res.ok) throw new Error('Failed to load bookings');
        const data = await res.json();
        setIncoming(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Incoming Requests</h3>
      {incoming.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        incoming.map((req) => (
          <div key={req.id} className="p-4 border border-gray-700 rounded-lg">
            <p>From: {req.name}</p>
            <p>Service: {req.service}</p>
            <p>Date: {req.date}</p>
          </div>
        ))
      )}
    </div>
  );
}
