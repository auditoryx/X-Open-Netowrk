'use client';

import React from 'react';
import { UserProfile } from '@/types/user';
import { useProfileCompletion } from '@/lib/hooks/useProfileCompletion';

type Props = {
  profile: UserProfile;
};

export default function ProfileCompletionMeter({ profile }: Props) {
  const { score, checklist } = useProfileCompletion(profile);

  return (
    <div className="bg-white text-black p-4 rounded-xl shadow-md mb-6 text-sm w-full max-w-md">
      <h3 className="text-lg font-semibold mb-2">Profile Completion</h3>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mb-2">{score}% complete</p>

      <ul className="space-y-1">
        {checklist.map((item) => (
          <li key={item.key} className="flex items-center gap-2">
            <span>{item.done ? '✅' : '❌'}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
