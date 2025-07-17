"use client";
import { useState, FormEvent } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

interface AvailabilityState {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
}

export default function AvailabilityForm(): JSX.Element {
  const [availability, setAvailability] = useState<AvailabilityState>({
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: true,
  });

  const handleChange = (day: keyof AvailabilityState): void => {
    setAvailability((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), { availability }, { merge: true });
      alert("Availability saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save availability.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <h2 className="text-xl font-bold mb-2">Set Weekly Availability</h2>
      {Object.keys(availability).map((day) => (
        <div key={day} className="flex items-center gap-4">
          <label htmlFor={`avail-${day}`} className="capitalize">
            {day}
          </label>
          <input
            id={`avail-${day}`}
            type="checkbox"
            checked={availability[day as keyof AvailabilityState]}
            onChange={() => handleChange(day as keyof AvailabilityState)}
            className="scale-125"
          />
        </div>
      ))}
      <button type="submit" className="btn btn-primary">Save Availability</button>
    </form>
  );
}
