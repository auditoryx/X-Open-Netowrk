'use client';

import Navbar from '@/app/components/Navbar';

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold mb-6">Creators</h1>
        <p className="text-lg text-gray-400 mb-8">Find top creators across all categories.</p>
      </div>
    </div>
  );
}
