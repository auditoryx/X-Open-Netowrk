'use client';
import React from 'react';

export default function ContractViewer({ terms, agreedByClient, agreedByProvider }: {
  terms: string;
  agreedByClient: boolean;
  agreedByProvider: boolean;
}) {
  return (
    <div className="p-4 border rounded-lg bg-white text-black">
      <h2 className="font-bold text-lg mb-2">📄 Booking Agreement</h2>
      <p className="whitespace-pre-line mb-4">{terms}</p>
      <p className="text-sm">✅ Client Agreed: {agreedByClient ? 'Yes' : 'No'}</p>
      <p className="text-sm">✅ Provider Agreed: {agreedByProvider ? 'Yes' : 'No'}</p>
    </div>
  );
}
