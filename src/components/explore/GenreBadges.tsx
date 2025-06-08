'use client';
export default function GenreBadges({ genres }: { genres: string[] }) {
  if (!genres?.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mb-1">
      {genres.map(g => (
        <span
          key={g}
          className="bg-neutral-700 text-xs px-2 py-0.5 rounded-full"
        >
          {g}
        </span>
      ))}
    </div>
  );
}
