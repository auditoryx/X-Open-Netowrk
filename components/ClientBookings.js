"use client";
import { useEffect, useState } from "react";

export default function ClientBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/bookings');
        if (!res.ok) throw new Error('Failed to load bookings');
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Your Bookings</h3>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="p-4 border border-gray-700 rounded-lg">
            <p>Service: {booking.service}</p>
            <p>Date: {booking.date}</p>
          </div>
        ))
      )}
    </div>
  );
}
