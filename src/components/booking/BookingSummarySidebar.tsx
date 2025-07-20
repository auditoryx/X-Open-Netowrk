'use client';

import TierBadge from '@/components/badges/TierBadge';
import { useState } from 'react';

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
  const [showTerms, setShowTerms] = useState(false);

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
      <button
        type="button"
        onClick={() => setShowTerms(true)}
        className="text-xs underline text-blue-400 mt-1"
      >
        Terms & Refund Policy
      </button>

      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-4 rounded max-w-sm">
            <h2 className="text-lg font-bold mb-2">Escrow Terms</h2>
            <p className="text-sm mb-4">
              Funds are held in escrow until both parties confirm the work is completed. Refunds are issued according to our policy.
            </p>
            <a href="/legal/escrow" className="text-blue-600 underline text-sm" target="_blank" rel="noopener noreferrer">
              View full policy
            </a>
            <div className="mt-4 text-right">
              <button onClick={() => setShowTerms(false)} className="btn btn-primary px-3 py-1 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
