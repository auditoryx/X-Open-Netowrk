'use client';

import { useState } from 'react';

interface Props {
  bookingId: string;
  terms: string;
  agreedByClient: boolean;
  agreedByProvider: boolean;
  userRole: 'client' | 'provider';
  onAgree: () => void;
}

export default function ContractViewer({ bookingId, terms, agreedByClient, agreedByProvider, userRole, onAgree }: Props) {
  const hasAgreed = userRole === 'client' ? agreedByClient : agreedByProvider;

  return (
    <div className="bg-gray-800 text-white p-4 rounded-md mb-4">
      <h3 className="text-lg font-bold mb-2">📜 Booking Contract</h3>
      <p className="text-sm whitespace-pre-line mb-4">{terms}</p>

      {!hasAgreed ? (
        <button
          onClick={onAgree}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          ✅ Agree to Contract
        </button>
      ) : (
        <p className="text-green-400">You’ve agreed to this contract.</p>
      )}
    </div>
  );
}
