"use client";
import { useRouter } from "next/navigation";

export default function ServiceDetail() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-4xl font-bold">Service Details</h1>
      <p>Details about the selected service will go here.</p>
      <button onClick={() => router.back()} className="bg-gray-800 text-white px-4 py-2 mt-4 rounded">
        Go Back
      </button>
    </div>
  );
}
