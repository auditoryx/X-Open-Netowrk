'use client';

import Link from 'next/link';

export default function CreatorCard({
  name,
  price,
  tagline,
  location,
  rating,
  reviewCount,
  verified,
  imageUrl,
  id,
}: {
  name: string;
  price: number;
  tagline: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  imageUrl?: string;
  id: string;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2 shadow hover:border-white/20 transition">
      <div className="flex items-center gap-3">
        <img
          src={imageUrl || '/default-avatar.jpg'}
          alt={name}
          className="w-12 h-12 rounded-full object-cover bg-white"
        />
        <div className="flex flex-col">
          <p className="font-semibold text-white flex items-center gap-2">
            {name}
            {verified && (
              <span className="text-blue-400 text-xs bg-blue-400/10 px-2 py-0.5 rounded-full">
                ✔ Verified
              </span>
            )}
          </p>
          <p className="text-xs text-gray-400">{location}</p>
        </div>
      </div>
      <p className="text-sm text-gray-300">{tagline}</p>
      <div className="text-xs text-gray-400">
        ⭐ {rating ?? '–'} ({reviewCount ?? 0} reviews)
      </div>
      <p className="font-bold text-white">${price}</p>
      <Link
        href={`/profile/${id}`}
        className="block text-center border mt-2 py-1 rounded hover:bg-white hover:text-black transition"
      >
        View Profile
      </Link>
    </div>
  );
}
