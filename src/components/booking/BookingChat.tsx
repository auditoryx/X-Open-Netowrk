'use client';

import React, { useState, useEffect, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { format } from 'date-fns';
import { sendMessage } from '@/lib/firestore/chat/sendMessage';
import { uploadChatMedia } from '@/lib/firebase/uploadChatMedia';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { listenToTyping } from '@/lib/firestore/chat/listenToTyping';
import { setTypingStatus } from '@/lib/firestore/chat/setTypingStatus';
import { markMessagesAsSeen } from '@/lib/firestore/chat/markMessagesAsSeen';
import { AiOutlinePaperClip } from 'react-icons/ai';
import Image from 'next/image';

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
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
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
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

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
    if (!user?.uid || (!text.trim() && !file) || sending) return;
    setSending(true);

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
    setPreview(null);
    setTypingStatus(bookingId, user.uid, false);
    setSending(false);
  };

  if (isLoading && messages.length === 0) {
    return <Skeleton count={5} height={32} className="mb-2 rounded" />;
  }

  return (
    <div className="space-y-4">
      {!isOnline && (
        <div className="bg-red-600 text-white text-center text-xs p-1 rounded">
          You&apos;re offline
        </div>
      )}
      <div className="overflow-auto">
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
                  <Image
                    src={msg.mediaUrl}
                    alt="Message media"
                    width={500}
                    height={500}
                    className="w-32 rounded mb-1 mx-auto"
                  />
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
      </div>

      {isTyping && (
        <p className="text-xs italic text-gray-400">They’re typing...</p>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            className="border p-2 rounded flex-1"
            value={text}
            onChange={e => {
              setText(e.target.value);
              handleTyping();
            }}
            placeholder="Type your message..."
          />
          <label className="p-2 cursor-pointer" htmlFor="chat-file">
            <AiOutlinePaperClip />
            <input
              id="chat-file"
              type="file"
              accept="image/*,video/*,audio/*"
              className="sr-only"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={handleSend}
            disabled={(!text.trim() && !file) || sending}
          >
            {sending ? 'Processing…' : 'Send'}
          </button>
        </div>
        {preview && (
          <div className="mt-2">
            {file?.type.startsWith('video') ? (
              <video
                src={preview}
                className="w-20 h-20 rounded object-cover cursor-pointer"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
              />
            ) : (
              <Image
                src={preview}
                alt="Preview of uploaded file"
                className="w-20 h-20 rounded object-cover cursor-pointer"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
