'use client';

import Navbar from '@/app/components/Navbar';

export default function ExploreRolePage({ params }: { params: { role: string } }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold mb-4 capitalize">{params.role} Services</h1>
        <p className="text-lg text-gray-400">Browse all available {params.role} services.</p>
      </div>
    </div>
  );
}
