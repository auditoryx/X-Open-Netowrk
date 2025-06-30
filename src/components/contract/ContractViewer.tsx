'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  terms: string;
  agreedByClient: boolean;
  agreedByProvider: boolean;
  userRole: 'client' | 'provider';
  onAgree: () => Promise<void>;
}

export default function ContractViewer({
  terms,
  agreedByClient,
  agreedByProvider,
  userRole,
  onAgree,
}: Props) {
  const [loading, setLoading] = useState(false);
  const hasAgreed = userRole === 'client' ? agreedByClient : agreedByProvider;

  const handleAgree = async () => {
    if (loading || hasAgreed) return;
    setLoading(true);

    try {
      await onAgree();
      toast.success('Contract successfully agreed.');
    } catch (err) {
      console.error('Agreement failed:', err);
      toast.error('Failed to submit agreement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-md mb-4">
      <h3 className="text-lg font-bold mb-2">📜 Booking Contract</h3>
      <p className="text-sm whitespace-pre-line mb-4 text-gray-200">{terms}</p>

      {!hasAgreed ? (
        <button
          onClick={handleAgree}
          disabled={loading}
          aria-label="Agree to contract"
          className={`px-4 py-2 rounded font-medium transition ${
            loading
              ? 'bg-gray-500 text-white cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {loading ? 'Submitting...' : '✅ Agree to Contract'}
        </button>
      ) : (
        <p className="text-green-400 font-semibold">✅ You’ve agreed to this contract.</p>
      )}
    </div>
  );
}
