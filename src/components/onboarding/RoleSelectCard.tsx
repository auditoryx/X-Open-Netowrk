'use client';
import Link from 'next/link';

type Role = {
  label: string;
  value: string;
};

export default function RoleSelectCard({ role }: { role: Role }) {
  return (
    <Link
      href={`/apply/${role.value}`}
      className="border border-neutral-700 rounded-xl p-6 hover:border-white/70 transition block"
    >
      <h2 className="text-xl font-semibold">{role.label}</h2>
      <p className="text-sm text-gray-400 mt-2">
        Apply as a {role.label.toLowerCase()} to list services and get booked.
      </p>
    </Link>
  );
}
