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
    <div
      className="bg-white text-black p-4 rounded-xl shadow-md mb-6 text-sm w-full max-w-md"
      title="Complete profiles get 3x bookings!"
    >
      <h3 className="text-lg font-semibold mb-2">Profile Completion</h3>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mb-2" title="Complete profiles get 3x bookings!">{score}% complete</p>

      <ul className="space-y-1">
        {checklist.map((item) => (
          <li key={item.key}>
            <a
              href={`/dashboard/edit#${item.key}`}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition focus:outline-none focus:ring"
            >
              <span>{item.done ? '✅' : '❌'}</span>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
