"use client";
import { useState, FormEvent, ChangeEvent } from "react";

interface FormData {
  date: string;
  time: string;
  notes: string;
}

interface SendServiceRequestProps {
  serviceId?: string;
  recipientId?: string;
  recipientRole?: "studio" | "provider" | "creator" | "admin";
}

export default function SendServiceRequest({
  serviceId = "",
  recipientId = "",
  recipientRole = "studio",
}: SendServiceRequestProps): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    date: "",
    time: "",
    notes: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          date: formData.date,
          time: formData.time,
          message: formData.notes,
        }),
      });

      if (!res.ok) throw new Error('Request failed');

      setFormData({ date: '', time: '', notes: '' });
      alert('Request sent successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to send request');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-lg max-w-xl">
      <h2 className="text-xl font-bold">Send Service Request</h2>

      <input
        type="date"
        name="date"
        onChange={handleChange}
        className="p-3 rounded-md w-full bg-gray-800 border border-gray-700 text-white"
      />

      <input
        type="time"
        name="time"
        onChange={handleChange}
        className="p-3 rounded-md w-full bg-gray-800 border border-gray-700 text-white"
      />

      <textarea
        name="notes"
        placeholder="What do you need?"
        onChange={handleChange}
        className="p-3 rounded-md w-full bg-gray-800 border border-gray-700 text-white"
      />

      <button type="submit" className="btn btn-primary w-full">Send Request</button>
    </form>
  );
}
