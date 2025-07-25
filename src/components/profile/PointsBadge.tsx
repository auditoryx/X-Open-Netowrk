'use client';
export function PointsBadge({ points = 0 }: { points: number }) {
  const label = points + ' XP';
  let color = 'bg-gray-700';
  if (points >= 500) color = 'bg-emerald-600';
  if (points >= 2000) color = 'bg-yellow-500'; // Signature flair
  return (
    <span
      aria-label={label}
      title="Earn XP by collaborating and completing bookings"
      className={`inline-block px-2 py-0.5 rounded text-xs text-white ${color}`}
    >
      {label}
    </span>
  );
}
