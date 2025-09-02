'use client';
import { useState, FormEvent, ChangeEvent } from "react";
import { addBooking } from "../lib/firestoreHelpers";

interface BookingForm {
  name: string;
  contact: string;
  message: string;
}

interface BookingRequestFormProps {
  userId: string;
  serviceId: string;
}

export default function BookingRequestForm({ userId, serviceId }: BookingRequestFormProps) {
  const [form, setForm] = useState<BookingForm>({ name: "", contact: "", message: "" });
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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
