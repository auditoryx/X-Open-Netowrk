export function PointsBadge({ points }: { points?: number }) {
  if (!points || points < 100) return null;
  return (
    <span className="text-yellow-400 text-sm" title="Top contributor badge">
      ⭐ Top Contributor
    </span>
  );
}
