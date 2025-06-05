'use client';
import { CheckCircle } from 'lucide-react';

export default function VerifiedBadge() {
  return (
    <span className="inline-flex items-center text-xs font-semibold text-blue-400 border border-blue-400 rounded-full px-2 py-0.5 ml-2">
      <CheckCircle className="w-3 h-3 mr-1" />
      Verified
    </span>
  );
}
