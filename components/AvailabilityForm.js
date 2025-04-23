"use client";
import { useState } from "react";

export default function AvailabilityForm() {
  const [availability, setAvailability] = useState({
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: true,
  });

  const handleChange = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Availability saved.");
    // TODO: Send to backend
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <h2 className="text-xl font-bold mb-2">Set Weekly Availability</h2>
      {Object.keys(availability).map((day) => (
        <div key={day} className="flex items-center gap-4">
          <label className="capitalize">{day}</label>
          <input
            type="checkbox"
            checked={availability[day]}
            onChange={() => handleChange(day)}
            className="scale-125"
          />
        </div>
      ))}
      <button type="submit" className="btn btn-primary">Save Availability</button>
    </form>
  );
}
