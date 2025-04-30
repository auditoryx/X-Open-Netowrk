'use client';

import React from 'react';
import { useState } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { toast } from 'sonner';

export function PortfolioEditor({ uid, initial }: { uid: string; initial: string[] }) {
  const [links, setLinks] = useState(initial || []);
  const [newLink, setNewLink] = useState('');

  const addLink = () => {
    if (!newLink) return;
    setLinks(prev => [...prev, newLink]);
    setNewLink('');
  };

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const savePortfolio = async () => {
    const db = getFirestore(app);
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { portfolio: links });
    toast.success('Portfolio updated!');
  };

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-lg font-semibold">Portfolio Media</h2>

      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://..."
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          className="w-full p-2 rounded border text-black"
        />
        <button
          onClick={addLink}
          className="bg-blue-600 px-4 py-2 rounded text-white"
        >
          Add
        </button>
      </div>

      <ul className="list-disc ml-5 space-y-1">
        {links.map((url, i) => (
          <li key={i} className="text-sm flex items-center justify-between">
            <span className="truncate max-w-[80%]">{url}</span>
            <button onClick={() => removeLink(i)} className="text-red-400 text-xs">Remove</button>
          </li>
        ))}
      </ul>

      <button
        onClick={savePortfolio}
        className="bg-green-600 px-6 py-2 rounded text-white"
      >
        Save Portfolio
      </button>
    </div>
  );
}
