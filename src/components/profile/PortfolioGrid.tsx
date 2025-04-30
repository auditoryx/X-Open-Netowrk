'use client';
import React from 'react';

export function PortfolioGrid({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mt-8">
      <h2 className="text-xl font-bold mb-4">Portfolio</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((url, i) => {
          const isVideo = url.includes('youtube') || url.includes('vimeo');

          return (
            <div key={i} className="border rounded overflow-hidden bg-white text-black">
              {isVideo ? (
                <iframe
                  src={url}
                  title={`portfolio-${i}`}
                  className="w-full h-60"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <img src={url} alt={`portfolio-${i}`} className="w-full h-60 object-cover" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
