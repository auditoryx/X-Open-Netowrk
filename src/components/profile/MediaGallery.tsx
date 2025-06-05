'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getMediaSamples } from '@/lib/firestore/getMediaSamples';
import { useAuth } from '@/lib/hooks/useAuth';
import { deleteMediaSample } from '@/lib/firestore/deleteMediaSample';

type Media = {
  type: string;
  url: string;
};

const MediaGallery = () => {
  const [samples, setSamples] = useState<Media[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getMediaSamples(user.uid).then(setSamples);
    }
  }, [user]);

  const handleDelete = async (sample: Media) => {
    const confirmed = window.confirm('Are you sure you want to delete this file?');
    if (!confirmed || !user?.uid) return;

    await deleteMediaSample(user.uid, sample);
    setSamples((prev) => prev.filter((s) => s.url !== sample.url));
  };

  if (!user) return null;
  if (!samples.length) return <p>No media uploaded yet.</p>;

  return (
    <div className="grid gap-4 mt-4">
      {samples.map((sample, idx) => (
        <div key={idx} className="border rounded-xl p-2 relative">
          {sample.type === 'image' && (
            <Image src={sample.url} alt="media" width={300} height={300} loading="lazy" className="w-full max-w-xs rounded" />
          )}
          {sample.type === 'video' && (
            <video controls src={sample.url} loading="lazy" className="w-full max-w-xs rounded" />
          )}
          {sample.type === 'audio' && (
            <audio controls src={sample.url} className="w-full" />
          )}
          <button
            onClick={() => handleDelete(sample)}
            className="absolute top-2 right-2 text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default MediaGallery;
