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
    <form onSubmit={handleSubmit} className="card-brutalist spacing-brutalist-md">
      <h3 className="heading-brutalist-sm mb-6">BOOK SERVICE</h3>
      <div className="space-y-6">
        <input
          className="input-brutalist"
          placeholder="YOUR NAME"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input-brutalist"
          placeholder="SERVICE NAME"
          value={service}
          onChange={(e) => setService(e.target.value)}
        />
        <button className="btn-brutalist w-full">BOOK NOW</button>
      </div>
    </form>
  );
}
