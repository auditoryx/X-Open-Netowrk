"use client";

import { useState } from "react";
import { initiateBookingWithStripe } from "@/lib/stripe/initiateBookingWithStripe";

export default function BookingForm({ providerId, serviceId, userId }: { providerId: string; serviceId: string; userId: string }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<null | "success" | "error">(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await initiateBookingWithStripe({ providerId, serviceId, userId, date, time, message });
      setStatus("success");
      setDate("");
      setTime("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-900 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold">Book This Service</h2>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
        className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
      />
      <textarea
        placeholder="Message for the provider"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-3 h-28 bg-gray-800 text-white rounded border border-gray-600"
      />
      <button type="submit" className="btn btn-primary w-full">Submit Booking</button>

      {status === "success" && <p className="text-green-400">Booking submitted!</p>}
      {status === "error" && <p className="text-red-500">Something went wrong. Try again.</p>}
    </form>
  );
}
