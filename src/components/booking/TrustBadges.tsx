'use client';

import { ShieldCheck, CheckCircle, Lock } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: <ShieldCheck className="w-4 h-4" />,
      label: 'AuditoryX Guarantee',
    },
    {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Verified Creators Only',
    },
    {
      icon: <Lock className="w-4 h-4" />,
      label: 'Secure Payments',
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 mt-4 text-sm text-white">
      {badges.map((b, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1"
        >
          {b.icon}
          {b.label}
        </div>
      ))}
    </div>
  );
}
