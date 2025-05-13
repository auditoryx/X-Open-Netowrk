'use client';

import React from 'react';

type Props = {
  lastSynced: string | null;
};

export default function SyncStatusBadge({ lastSynced }: Props) {
  if (!lastSynced) {
    return (
      <p className="text-sm text-gray-500">🔴 Not synced yet</p>
    );
  }

  const last = new Date(lastSynced);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let label = '';
  if (diffMins < 1) label = '🟢 Just synced';
  else if (diffMins < 60) label = `🟢 Synced ${diffMins} min ago`;
  else if (diffHours < 24) label = `🟡 Synced ${diffHours}h ago`;
  else label = `🔴 Not synced in ${diffDays}d`;

  return <p className="text-sm text-gray-500">{label}</p>;
}
