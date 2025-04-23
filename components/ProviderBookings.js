"use client";
import { useEffect, useState } from "react";

export default function ProviderBookings() {
  const [incoming, setIncoming] = useState([]);

  useEffect(() => {
    // Mock data — replace with real fetch call later
    setIncoming([
      { id: 3, name: "Zenji", service: "Vocal Engineering", date: "2025-04-25" },
    ]);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Incoming Requests</h3>
      {incoming.map((req) => (
        <div key={req.id} className="p-4 border border-gray-700 rounded-lg">
          <p>From: {req.name}</p>
          <p>Service: {req.service}</p>
          <p>Date: {req.date}</p>
        </div>
      ))}
    </div>
  );
}
