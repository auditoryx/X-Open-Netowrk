'use client';

import TierBadge from '@/components/ui/TierBadge';

export default function BookingSummarySidebar({
  providerName,
  providerTier,
  providerLocation,
  selectedTime,
  baseAmount,
  platformFee,
}: {
  providerName: string;
  providerTier: 'standard' | 'verified' | 'signature';
  providerLocation: string;
  selectedTime: string;
  baseAmount: number;
  platformFee: number;
}) {
  const total = baseAmount + platformFee;

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl text-white space-y-4">
      <div>
        <h3 className="font-bold text-xl mb-1">{providerName}</h3>
        <TierBadge tier={providerTier} />
        <p className="text-sm text-gray-400">{providerLocation}</p>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-gray-300">📆 Selected Time</h4>
        <p className="text-sm">{new Date(selectedTime).toLocaleString()}</p>
      </div>

      <div className="text-sm space-y-1">
        <p>💼 Base Amount: ¥{baseAmount}</p>
        <p>🛡 Platform Fee: ¥{platformFee}</p>
        <hr className="border-neutral-700" />
        <p className="font-semibold text-white">💳 Total: ¥{total}</p>
      </div>

      <div className="text-xs text-gray-400 mt-2">
        ✔ Your payment is held securely and released only when the session is completed.
        This is protected under the AuditoryX Guarantee.
      </div>
    </div>
  );
}
