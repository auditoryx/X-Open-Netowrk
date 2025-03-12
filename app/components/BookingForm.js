"use client";
import { useState } from "react";

export default function BookingForm({ recipient }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("Studio Session");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [autoBook, setAutoBook] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    alert("Booking request sent!");
    
    // Later, integrate with database or email API
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg text-white w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Book {recipient}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="p-3 bg-gray-800 text-white rounded-md"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          className="p-3 bg-gray-800 text-white rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select
          className="p-3 bg-gray-800 text-white rounded-md"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option>Studio Session</option>
          <option>Beat Purchase</option>
          <option>Mixing/Mastering</option>
          <option>Music Video Shoot</option>
        </select>
        <input
          type="date"
          className="p-3 bg-gray-800 text-white rounded-md"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="time"
          className="p-3 bg-gray-800 text-white rounded-md"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
        <textarea
          placeholder="Project details or notes..."
          className="p-3 bg-gray-800 text-white rounded-md h-28"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={autoBook} onChange={() => setAutoBook(!autoBook)} />
          <span>Auto-book if available</span>
        </label>
        <button type="submit" className="bg-blue-600 p-3 rounded-md text-white hover:bg-blue-700">
          Send Request
        </button>
      </form>
    </div>
  );
}
