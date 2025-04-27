'use client';

import Navbar from '@/app/components/Navbar';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-6">Success!</h1>
      <p className="text-lg text-gray-400">Your operation was completed successfully.</p>
    </div>
  );
}
