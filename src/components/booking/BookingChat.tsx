'use client';

import { useEffect, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { format } from 'date-fns'
import { sendMessage } from '@/lib/firestore/chat/sendMessage'
import { uploadChatMedia } from '@/lib/firebase/uploadChatMedia'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/hooks/useAuth';
import { listenToTyping } from '@/lib/firestore/chat/listenToTyping';
import { setTypingStatus } from '@/lib/firestore/chat/setTypingStatus';
import { markMessagesAsSeen } from '@/lib/firestore/chat/markMessagesAsSeen';

interface Message {
  id: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  createdAt?: any;
}

type Props = {
  bookingId: string;
};

export default function BookingChat({ bookingId }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isTyping, setTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    const q = query(
      collection(db, 'bookings', bookingId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setMessages(msgs);
      setLoading(false);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (user?.uid) markMessagesAsSeen(bookingId, user.uid);
    });
    return () => unsub();
  }, [bookingId, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = listenToTyping(bookingId, users => {
      setTyping(users.filter(id => id !== user.uid).length > 0);
    });
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      unsub();
    };
  }, [bookingId, user?.uid]);

  const handleTyping = () => {
    if (!user?.uid) return;
    setTypingStatus(bookingId, user.uid, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(bookingId, user.uid, false);
    }, 1500);
  };

  const handleSend = async () => {
    if (!user?.uid || (!text.trim() && !file)) return;

    let mediaUrl: string | null = null
    if (file) {
      mediaUrl = await uploadChatMedia(bookingId, file)
    }

    await sendMessage({
      bookingId,
      senderId: user.uid,
      text: text.trim(),
      mediaUrl
    })

    setText('');
    setFile(null);
    setTypingStatus(bookingId, user.uid, false);
  };

  if (isLoading && messages.length === 0) {
    return <Skeleton count={5} height={32} className="mb-2 rounded" />;
  }

  return (
    <div className="space-y-4">
      {!isOnline && (
        <div className="bg-red-600 text-white text-center text-xs p-1 rounded">
          You're offline
        </div>
      )}
      <div className="h-64 overflow-y-auto border rounded p-2 bg-white text-black">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`text-sm p-2 my-1 rounded ${
              msg.senderId === user?.uid ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'
            }`}
          >
            {msg.mediaUrl && (
              msg.mediaUrl.endsWith('.mp3') ? (
                <audio controls src={msg.mediaUrl} className="mb-1 mx-auto" />
              ) : (
                <img src={msg.mediaUrl} className="w-32 rounded mb-1 mx-auto" />
              )
            )}
            {msg.text && <p>{msg.text}</p>}
            <div className="text-xs text-gray-500 mt-1">
              {format(
                msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(),
                'HH:mm'
              )}
              {msg.senderId === user?.uid && msg.seenBy?.length > 1 && ' ✓✓'}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {isTyping && (
        <p className="text-xs italic text-gray-400">They’re typing...</p>
      )}

      <div className="flex flex-col gap-2">
        <input
          className="border p-2 rounded"
          value={text}
          onChange={e => {
            setText(e.target.value);
            handleTyping();
          }}
          placeholder="Type your message..."
        />
        <input
          type="file"
          accept="image/*,audio/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        <button className="bg-black text-white px-4 py-2 rounded" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
