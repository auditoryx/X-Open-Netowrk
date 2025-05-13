'use client';

import React from 'react';

type Props = {
  lastSynced: string | null;
};

export default function SyncStatusBadge({ lastSynced }: Props) {
  if (!lastSynced) {
    return <span className="text-sm text-red-600">🔴 Never synced</span>;
  }

  const last = new Date(lastSynced).getTime();
  const now = Date.now();
  const diffMinutes = Math.floor((now - last) / 1000 / 60);

  let status = '🟢 Synced just now';
  if (diffMinutes > 120) status = '🔴 Not synced recently';
  else if (diffMinutes > 30) status = `🟡 Synced ${diffMinutes} mins ago`;
  else if (diffMinutes > 5) status = `🟢 Synced ${diffMinutes} mins ago`;

  return <span className="text-sm text-gray-500">{status}</span>;
}
