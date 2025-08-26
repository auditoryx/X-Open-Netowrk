'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { messageService, type MessageThread } from '@/lib/services/messageService';

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = messageService.listenToThreads(user.uid, setThreads);
    return () => unsub && unsub();
  }, [user]);

  if (loading) return <div>Loading…</div>;
  if (!user) return <div>Please sign in to view messages.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Messages</h1>
      {threads.length === 0 ? (
        <div className="text-gray-400">No conversations yet.</div>
      ) : (
        <ul className="divide-y divide-neutral-800 rounded border border-neutral-800">
          {threads.map(t => {
            const other = t.participants.find(p => p !== user.uid) || 'Unknown';
            const name = t.participantNames?.[other] || other;
            return (
              <li key={t.id} className="p-4 hover:bg-neutral-900">
                <Link href={`/dashboard/messages/${t.id}`} className="flex justify-between">
                  <span className="font-medium">{name}</span>
                  <span className="text-sm text-gray-400 truncate max-w-[60%]">{t.lastMessage || '…'}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
