import {
  collection, addDoc, query, where, orderBy,
  onSnapshot, doc, getDoc, getDocs, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: any;
  isRead: boolean;
};

export type MessageThread = {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: any;
  unreadCount: Record<string, number>;
};

class MessageService {
  private db = db!;

  async ensureThread(a: string, b: string, names: Record<string, string>) {
    const q = query(
      collection(this.db, 'messageThreads'),
      where('participants', 'array-contains', a)
    );
    const snap = await getDocs(q);
    const found = snap.docs.find(d => {
      const p = d.data().participants as string[];
      return p.includes(a) && p.includes(b);
    });
    if (found) return found.id;

    const ref = await addDoc(collection(this.db, 'messageThreads'), {
      participants: [a, b],
      participantNames: names,
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      unreadCount: { [a]: 0, [b]: 0 },
    });
    return ref.id;
  }

  listenToThreads(userId: string, cb: (threads: MessageThread[]) => void) {
    const q = query(
      collection(this.db, 'messageThreads'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const threads = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as MessageThread[];
      cb(threads);
    });
  }

  listenToMessages(threadId: string, cb: (msgs: Message[]) => void) {
    const q = query(
      collection(this.db, 'messageThreads', threadId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Message[];
      cb(msgs);
    });
  }

  async sendMessage(threadId: string, senderId: string, receiverId: string, text: string) {
    const msgRef = await addDoc(collection(this.db, 'messageThreads', threadId, 'messages'), {
      threadId, senderId, receiverId, text,
      createdAt: serverTimestamp(),
      isRead: false,
    });
    const tRef = doc(this.db, 'messageThreads', threadId);
    await updateDoc(tRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      [`unreadCount.${receiverId}`]: (await getDoc(tRef)).data()?.unreadCount?.[receiverId] + 1 || 1,
    });
    return msgRef.id;
  }

  async markMessagesAsRead(threadId: string, userId: string) {
    const tRef = doc(this.db, 'messageThreads', threadId);
    const tSnap = await getDoc(tRef);
    if (tSnap.exists()) {
      await updateDoc(tRef, { [`unreadCount.${userId}`]: 0 });
    }
  }
}

export const messageService = new MessageService();
