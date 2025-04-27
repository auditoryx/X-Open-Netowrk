'use client';
import Navbar from '@/app/components/Navbar';

export default function EditServicePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Edit Service</h1>
        <p className="text-lg text-gray-400">Editing service ID: {params.id}</p>
      </div>
    </div>
  );
}
