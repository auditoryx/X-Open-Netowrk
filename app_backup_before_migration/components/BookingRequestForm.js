'use client';
import { useState } from "react";
import { addBooking } from "../lib/firestoreHelpers";

export default function BookingRequestForm({ userId, serviceId }) {
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addBooking(userId, serviceId, form);
    setSuccess(true);
    setForm({ name: "", contact: "", message: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-white">Request Booking</h3>
      <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your Name" required className="w-full p-2 rounded" />
      <input type="email" name="contact" value={form.contact} onChange={handleChange} placeholder="Your Email" required className="w-full p-2 rounded" />
      <textarea name="message" value={form.message} onChange={handleChange} placeholder="Project Details" required className="w-full p-2 rounded h-24" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Send Request</button>
      {success && <p className="text-green-400 mt-2">Booking sent!</p>}
    </form>
  );
}
