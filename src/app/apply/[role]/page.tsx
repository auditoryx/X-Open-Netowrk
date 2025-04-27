'use client';
import Navbar from '@/app/components/Navbar';

export default function ApplyRolePage({ params }: { params: { role: string } }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold mb-4 capitalize">Apply as {params.role}</h1>
        <p className="text-lg text-gray-400">Submit your application to join as a {params.role}.</p>
      </div>
    </div>
  );
}
