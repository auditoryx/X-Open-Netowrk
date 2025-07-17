"use client";
import { useState, FormEvent } from "react";

export default function BookingForm(): JSX.Element {
  const [name, setName] = useState<string>("");
  const [service, setService] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
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
        className="input-base"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="input-base"
        placeholder="Service Name"
        value={service}
        onChange={(e) => setService(e.target.value)}
      />
      <button className="btn btn-primary w-full">Book</button>
    </form>
  );
}
