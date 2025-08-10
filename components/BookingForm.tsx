"use client";
import React, { useState, FormEvent } from "react";
import toast from "react-hot-toast";

export default function BookingForm() {
  const [name, setName] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({ name, service }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Booking created successfully!");
        setName("");
        setService("");
      } else {
        toast.error("Failed to create booking. Please try again.");
      }
    } catch (error) {
      console.error('Booking creation failed:', error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        <button 
          className="btn-brutalist w-full"
          disabled={isLoading}
        >
          {isLoading ? "BOOKING..." : "BOOK NOW"}
        </button>
      </div>
    </form>
  );
}
