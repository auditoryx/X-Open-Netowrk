'use client';

import { useRouter } from 'next/navigation';

export default function RoleSwitcher({
  currentRole,
  roles
}: {
  currentRole: string;
  roles: string[];
}) {
  const router = useRouter();

  if (roles.length <= 1) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    router.push(`/dashboard/${role}`);
  };

  return (
    <div className="mb-4">
      <label className="text-sm text-white mr-2">Switch Role:</label>
      <select
        value={currentRole}
        onChange={handleChange}
        className="text-black px-2 py-1 rounded"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
