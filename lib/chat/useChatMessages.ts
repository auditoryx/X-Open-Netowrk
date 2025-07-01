import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  DocumentData 
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  text: string;
  sentAt: any;
  seen?: boolean;
}

interface UseChatMessagesReturn {
  messages: Message[];
  loading: boolean;
  error?: string;
}

export const useChatMessages = (bookingId: string): UseChatMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    const messagesRef = collection(db, 'chats', bookingId, 'messages');
    const q = query(messagesRef, orderBy('sentAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messageList: Message[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          messageList.push({
            id: doc.id,
            senderUid: data.senderUid,
            senderName: data.senderName,
            text: data.text,
            sentAt: data.sentAt,
            seen: data.seen,
          });
        });

        setMessages(messageList);
        setLoading(false);
        setError(undefined);
      },
      (err) => {
        console.error('Error fetching messages:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [bookingId]);

  return { messages, loading, error };
};
