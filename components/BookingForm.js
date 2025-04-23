"use client";
import { useState } from "react";

export default function BookingForm() {
  const [name, setName] = useState("");
  const [service, setService] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/bookings", {
      method: "POST",
      body: JSON.stringify({ name, service }),
    });
    const result = await res.json();
    if (result.success) alert("Booking created!");
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-900 rounded-xl space-y-4">
      <input
        className="p-3 rounded w-full bg-black border border-gray-700 text-white"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="p-3 rounded w-full bg-black border border-gray-700 text-white"
        placeholder="Service Name"
        value={service}
        onChange={(e) => setService(e.target.value)}
      />
      <button className="btn btn-primary w-full">Book</button>
    </form>
  );
}
