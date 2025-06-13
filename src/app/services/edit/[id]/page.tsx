'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Translate } from '@/i18n/Translate';

export default function EditServicePage() {
  const { id: rawId } = useParams();
  const id = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '';
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      const ref = doc(db, 'services', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title || '');
        setDescription(data.description || '');
        setPrice(data.price?.toString() || '');
      } else {
        setError('Service not found');
      }
      setLoading(false);
    };

    fetchService();
  }, [id]);

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || !price.trim()) {
      setError('All fields are required.');
      return;
    }

    const ref = doc(db, 'services', id);
    await updateDoc(ref, {
      title,
      description,
      price: parseFloat(price),
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-2xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-6">Edit Service</h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm mb-1">Title</label>
            <input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="edit-description" className="block text-sm mb-1">Description</label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
              rows={5}
            />
          </div>
          <div>
            <label htmlFor="edit-price" className="block text-sm mb-1">Price (USD)</label>
            <input
              id="edit-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-white text-black font-semibold px-6 py-2 rounded hover:bg-gray-200 transition"
          >
            <Translate t="button.saveChanges" />
          </button>

          {success && <p className="text-green-400 mt-2">✅ Service updated!</p>}
        </div>
      </div>
    </div>
  );
}
