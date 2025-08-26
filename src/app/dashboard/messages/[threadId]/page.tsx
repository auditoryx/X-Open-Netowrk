'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { messageService, type Message } from '@/lib/services/messageService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!threadId) return;
    const unsub = messageService.listenToMessages(threadId, setMessages);
    return () => unsub && unsub();
  }, [threadId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <div>Loading…</div>;
  if (!user) return <div>Please sign in.</div>;

  const send = async () => {
    if (!text.trim() || !user) return;

    let receiverId = 'unknown';
    try {
      const tSnap = await getDoc(doc(db!, 'messageThreads', threadId));
      const participants = (tSnap.data()?.participants ?? []) as string[];
      receiverId = participants.find(p => p !== user.uid) ?? 'unknown';
    } catch (e) {
      console.error('[thread] failed to fetch thread doc:', e);
    }

    await messageService.sendMessage(threadId, user.uid, receiverId, text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)]">
      <div className="flex-1 overflow-y-auto space-y-2 p-4 border border-neutral-800 rounded">
        {messages.map(m => (
          <div key={m.id} className={`max-w-[70%] p-2 rounded ${m.senderId === user.uid ? 'ml-auto bg-blue-600' : 'bg-neutral-800'}`}>
            {m.text}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-2 outline-none"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message…"
        />
        <button onClick={send} className="px-4 py-2 rounded bg-white text-black">Send</button>
      </div>
    </div>
  );
}
