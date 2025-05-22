'use client';

export default function TierBadge({ tier }: { tier: string }) {
  if (!tier || tier === 'standard') return null;

  const isSignature = tier === 'signature';
  const style = isSignature
    ? 'border-yellow-400 text-yellow-300 shadow shadow-yellow-400/50'
    : 'border-blue-400 text-blue-300 shadow shadow-blue-400/50';

  const label = isSignature ? 'Signature' : 'Verified';

  return (
    <span
      className={`ml-2 text-xs px-2 py-0.5 rounded-full border font-semibold tracking-wide ${style}`}
    >
      {label}
    </span>
  );
}
