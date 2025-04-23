"use client";

import { useState } from "react";
import { createBooking } from "@/lib/createBooking";

export default function BookingPage() {
  const [form, setForm] = useState({
    providerId: "",
    serviceId: "",
    userId: "",
    date: "",
    time: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createBooking(form);
    if (res.success) {
      setSubmitted(true);
    } else {
      setError("Booking failed. Try again.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Book a Service</h1>

      {submitted ? (
        <p className="text-green-500">Booking submitted! We’ll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <input name="providerId" placeholder="Provider ID" onChange={handleChange} className="input" />
          <input name="serviceId" placeholder="Service ID" onChange={handleChange} className="input" />
          <input name="userId" placeholder="Your User ID" onChange={handleChange} className="input" />
          <input name="date" placeholder="Date (YYYY-MM-DD)" onChange={handleChange} className="input" />
          <input name="time" placeholder="Time (e.g. 14:00)" onChange={handleChange} className="input" />
          <textarea name="message" placeholder="Additional Message" onChange={handleChange} className="input h-32" />
          <button type="submit" className="btn btn-primary w-full">Submit Booking</button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      )}
    </main>
  );
}
