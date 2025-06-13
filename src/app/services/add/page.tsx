'use client';

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Translate } from '@/i18n/Translate';

export default function AddServicePage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!title.trim() || !description.trim() || !price.trim()) {
      return setError('All fields are required.');
    }
    if (!user) return setError('You must be logged in.');

    await addDoc(collection(db, 'services'), {
      title,
      description,
      price: parseFloat(price),
      creatorId: user.uid,
      creatorName: userData?.name || user.displayName || '',
      timestamp: serverTimestamp(),
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      router.push('/dashboard/services');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-2xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-6">Add New Service</h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {success && <p className="text-green-400 mb-4">✅ Service added!</p>}

        <div className="space-y-4">
          <div>
            <label htmlFor="service-title" className="block text-sm mb-1">
              Title
            </label>
            <input
              id="service-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="service-description" className="block text-sm mb-1">
              Description
            </label>
            <textarea
              id="service-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
              rows={5}
            />
          </div>
          <div>
            <label htmlFor="service-price" className="block text-sm mb-1">
              Price (USD)
            </label>
            <input
              id="service-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="bg-white text-black font-semibold px-6 py-2 rounded hover:bg-gray-200 transition"
          >
            <Translate t="button.submitService" />
          </button>
        </div>
      </div>
    </div>
  );
}
