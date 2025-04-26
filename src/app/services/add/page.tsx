'use client';

import { useState } from 'react';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '@/app/firebase';

export default function AddServicePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    const db = getFirestore(app);
    setLoading(true);

    try {
      await addDoc(collection(db, 'services'), {
        title,
        description,
        price: parseFloat(price),
        creatorId: user.uid,
        createdAt: Timestamp.now(),
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Create New Service</h1>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Title</label>
        <input type="text" className="w-full p-2 border rounded text-black" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Description</label>
        <textarea className="w-full p-2 border rounded text-black" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Price ($)</label>
        <input type="number" className="w-full p-2 border rounded text-black" value={price} onChange={e => setPrice(e.target.value)} />
      </div>
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
        {loading ? 'Creating...' : 'Create Service'}
      </button>
    </div>
  );
}
