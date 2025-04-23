"use client";
import { useEffect, useState } from "react";

export default function ClientBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Mock data — replace with real fetch call later
    setBookings([
      { id: 1, service: "Mixing", date: "2025-04-24" },
      { id: 2, service: "Studio Session", date: "2025-04-26" },
    ]);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Your Bookings</h3>
      {bookings.map((booking) => (
        <div key={booking.id} className="p-4 border border-gray-700 rounded-lg">
          <p>Service: {booking.service}</p>
          <p>Date: {booking.date}</p>
        </div>
      ))}
    </div>
  );
}
