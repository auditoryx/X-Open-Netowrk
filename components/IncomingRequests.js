"use client";
import { useEffect, useState } from "react";

export default function IncomingRequests({ userId }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch(`/api/bookings?userId=${userId}`)
      .then(res => res.json())
      .then(setRequests);
  }, [userId]);

  return (
    <div className="space-y-4 mt-10">
      <h2 className="text-xl font-bold">Incoming Requests</h2>
      {requests.length === 0 && <p className="text-gray-400">No requests yet.</p>}
      {requests.map(req => (
        <div key={req.id} className="bg-gray-900 p-4 rounded-md border border-gray-700">
          <p><strong>From:</strong> {req.senderId}</p>
          <p><strong>Date:</strong> {req.date}</p>
          <p><strong>Time:</strong> {req.time}</p>
          <p><strong>Notes:</strong> {req.notes}</p>
        </div>
      ))}
    </div>
  );
}
