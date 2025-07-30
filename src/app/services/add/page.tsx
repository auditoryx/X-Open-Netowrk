'use client';

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Translate } from '@/i18n/Translate';
import { AlertCircle } from 'lucide-react';

// Firebase availability check
let isFirebaseAvailable = false;
try {
  if (typeof window !== 'undefined') {
    isFirebaseAvailable = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );
  }
} catch (error) {
  console.warn('Firebase configuration check failed:', error);
  isFirebaseAvailable = false;
}

export default function AddServicePage() {
  // Defensive auth hook usage
  let user = null;
  let userData = null;
  
  try {
    if (isFirebaseAvailable) {
      const authResult = useAuth();
      user = authResult.user;
      userData = authResult.userData;
    }
  } catch (error) {
    console.warn('Auth hook failed, continuing without authentication:', error);
  }

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

    if (!isFirebaseAvailable) {
      setError('Service creation is currently unavailable. Please try again later.');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a service.');
      return;
    }

    try {
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
    } catch (error) {
      console.error('Failed to add service:', error);
      setError('Failed to create service. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Firebase Availability Warning */}
      {!isFirebaseAvailable && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Demo Mode:</strong> Service creation is currently unavailable. 
                This page is running in demonstration mode.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-6">
          Add New Service
          <span data-testid="smoke" className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            LOADED ✓
          </span>
        </h1>

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
            disabled={!isFirebaseAvailable}
            className={`font-semibold px-6 py-2 rounded transition ${
              isFirebaseAvailable
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Translate t="button.submitService" />
          </button>
        </div>
      </div>
    </div>
  );
}
