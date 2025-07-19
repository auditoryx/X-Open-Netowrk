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
    <div className="card-brutalist spacing-brutalist-md max-w-2xl">
      <h2 className="heading-brutalist-md mb-8">SET WEEKLY AVAILABILITY</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          {Object.keys(availability).map((day) => (
            <label key={day} className="flex items-center justify-between cursor-pointer">
              <span className="text-brutalist">{day.toUpperCase()}</span>
              <div className="relative">
                <input
                  id={`avail-${day}`}
                  type="checkbox"
                  checked={availability[day as keyof AvailabilityState]}
                  onChange={() => handleChange(day as keyof AvailabilityState)}
                  className="w-6 h-6 appearance-none border-2 border-white bg-black checked:bg-white cursor-pointer"
                />
                {availability[day as keyof AvailabilityState] && (
                  <span className="absolute inset-0 flex items-center justify-center text-black font-black text-sm pointer-events-none">
                    ✓
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
        <button type="submit" className="btn-brutalist w-full">SAVE AVAILABILITY</button>
      </form>
    </div>
  );
}
