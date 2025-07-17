"use client";
import AvailabilityForm from "../components/AvailabilityForm";

export default function AvailabilityPage(): JSX.Element {
  return (
    <main className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Set Your Availability</h1>
      <AvailabilityForm />
    </main>
  );
}
