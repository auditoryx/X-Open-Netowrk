'use client';

import TierBadge from '@/components/badges/TierBadge';
import Link from 'next/link';

export default function BookingSidebar({
  name,
  rating,
  reviewCount,
  proTier,
}: {
  name: string;
  rating?: number;
  reviewCount?: number;
  proTier?: 'standard' | 'verified' | 'signature';
}) {
  return (
    <aside className="border border-neutral-800 bg-neutral-900 p-4 rounded-xl text-white space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">{name}</h2>
        {proTier && <TierBadge tier={proTier} />}
      </div>

      <div className="text-sm text-gray-400">
        ⭐ {rating?.toFixed(1) ?? '–'} ({reviewCount ?? 0} reviews)
      </div>

      <div className="bg-neutral-800 text-sm p-3 rounded-lg mt-4 border border-neutral-700">
        🛡 Protected by <strong>AuditoryX Guarantee</strong><br />
        Your payment is only released after the creator completes your order.
        <div className="mt-2">
          <Link href="/legal/escrow" className="underline text-blue-400 text-xs" target="_blank">
            Terms & Refund Policy
          </Link>
        </div>
      </div>
    </aside>
  );
}
