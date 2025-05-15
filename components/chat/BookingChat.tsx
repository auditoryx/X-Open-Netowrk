'use client';

import React, { useEffect, useRef, useState } from 'react';
import { sendMessage, subscribeToMessages, markMessagesAsSeen } from '../../lib/firestore/messages';
import { useAuth } from '../../lib/hooks/useAuth';
import { format } from 'date-fns';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/firebaseConfig';

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: any;
  seen: boolean;
  mediaUrl?: string;
};

const BookingChat: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToMessages(bookingId, async (msgs: Message[]) => {
      setMessages(msgs);
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      await markMessagesAsSeen(bookingId, user?.uid);
    });
    return () => unsub();
  }, [bookingId, user?.uid]);

  const handleSend = async () => {
    if (!newMessage.trim() && !attachment) return;

    let mediaUrl = null;
    if (attachment) {
      const fileRef = ref(storage, `chats/${bookingId}/${Date.now()}_${attachment.name}`);
      await uploadBytes(fileRef, attachment);
      mediaUrl = await getDownloadURL(fileRef);
    }

    await sendMessage(bookingId, user?.uid, user?.displayName || '', newMessage, mediaUrl);
    setNewMessage('');
    setAttachment(null);
  };

  return (
    <div className="space-y-2">
      <div className="h-64 overflow-y-auto border rounded p-2 bg-white text-black">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`text-sm p-2 my-1 rounded ${
              msg.senderId === user?.uid ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'
            }`}
          >
            {msg.content && <p>{msg.content}</p>}
            {msg.mediaUrl && (
              <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="underline">
                View Attachment
              </a>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {format(msg.timestamp?.toDate?.() || new Date(), 'HH:mm')}
              {msg.senderId === user?.uid && msg.seen && ' ✓✓'}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="flex flex-col gap-2">
        <input
          className="border p-2 rounded"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <input
          type="file"
          onChange={(e) => setAttachment(e.target.files?.[0] || null)}
          accept="image/*,audio/*"
        />
        <button className="bg-black text-white px-4 py-2 rounded" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default BookingChat;
