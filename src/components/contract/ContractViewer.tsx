'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ContractViewer({ bookingId }: { bookingId: string }) {
  const [contract, setContract] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      const snap = await getDoc(doc(db, 'contracts', bookingId));
      if (snap.exists()) {
        setContract(snap.data()?.contractText);
      }
    };
    fetchContract();
  }, [bookingId]);

  if (!contract) return <p className="text-gray-400">Loading contract...</p>;

  return (
    <div className="whitespace-pre-wrap bg-white text-black p-6 rounded shadow">
      {contract}
    </div>
  );
}
