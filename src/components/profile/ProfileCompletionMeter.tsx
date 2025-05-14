'use client';

import React from 'react';
import { UserProfile } from '@/types/user';

type Props = {
  profile: UserProfile;
};

const checks = [
  { key: 'name', label: 'Name' },
  { key: 'bio', label: 'Bio' },
  { key: 'media', label: 'Profile Image' },
  { key: 'services', label: 'At least 1 Service' },
  { key: 'timezone', label: 'Timezone' },
];

export default function ProfileCompletionMeter({ profile }: Props) {
  const completed = checks.filter((item) => {
    const value = profile[item.key as keyof UserProfile];
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  });

  const percent = Math.round((completed.length / checks.length) * 100);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-6 text-sm">
      <h3 className="text-lg font-semibold mb-2">Profile Completion</h3>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: \`\${percent}%\` }}
        />
      </div>

      <ul className="space-y-1">
        {checks.map((item) => {
          const isDone = completed.some((c) => c.key === item.key);
          return (
            <li key={item.key} className="flex items-center gap-2">
              <span>{isDone ? '✅' : '❌'}</span>
              <span>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
