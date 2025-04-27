'use client';

import Navbar from '@/app/components/Navbar';

export default function ServiceDetailsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Service Details</h1>
        <p className="text-lg text-gray-400">More info about this service coming soon.</p>
      </div>
    </div>
  );
}
