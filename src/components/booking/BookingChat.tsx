'use client';

import { useEffect, useRef, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db, app } from '@/lib/firebase';
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
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isTyping, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    const q = query(
      collection(db, 'bookings', bookingId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setMessages(msgs);
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

    let mediaUrl: string | null = null;
    if (file) {
      const storage = getStorage(app);
      const ref = storageRef(
        storage,
        `bookings/${bookingId}/${Date.now()}_${file.name}`
      );
      await uploadBytes(ref, file);
      mediaUrl = await getDownloadURL(ref);
    }

    await addDoc(collection(db, 'bookings', bookingId, 'messages'), {
      senderId: user.uid,
      text: text.trim(),
      mediaUrl,
      createdAt: serverTimestamp(),
      seenBy: [user.uid]
    });

    setText('');
    setFile(null);
    setTypingStatus(bookingId, user.uid, false);
  };

  return (
    <div className="space-y-4">
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
