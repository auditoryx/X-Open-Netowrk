'use client';

import Link from 'next/link';
import TierBadge from '@/components/ui/TierBadge';

export default function CreatorCard({
  id,
  name,
  tagline,
  price,
  location,
  imageUrl,
  rating,
  reviewCount,
  proTier,
}: {
  id: string;
  name: string;
  tagline?: string;
  price?: number;
  location?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  proTier?: string;
}) {
  return (
    <Link
      href={`/profile/${id}`}
      className="bg-neutral-900 border border-white/10 hover:border-white/20 transition p-4 rounded-lg block"
    >
      <div className="flex items-center gap-3 mb-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-neutral-700" />
        )}

        <div>
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">{name}</h2>
            {proTier && <TierBadge tier={proTier} />}
          </div>
          <p className="text-sm text-gray-400">{location || 'Unknown'}</p>
        </div>
      </div>

      <p className="text-sm text-gray-300 mb-2 line-clamp-2">{tagline}</p>

      <div className="text-sm text-gray-400 flex justify-between items-center">
        <span>{rating?.toFixed(1) ?? '—'} ★ ({reviewCount ?? 0})</span>
        <span className="font-semibold text-white">
          {price ? `From ¥${price}` : 'Price TBD'}
        </span>
      </div>
    </Link>
  );
}
