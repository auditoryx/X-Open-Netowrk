'use client';
import Navbar from '@/app/components/Navbar';
export default function ProducersPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Producers</h1>
        <p className="text-gray-400">Find top music producers ready to work with you.</p>
      </div>
    </div>
  );
}
