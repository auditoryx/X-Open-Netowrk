import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs, orderBy, limit, startAfter, DocumentSnapshot } from "firebase/firestore";

export const sendMessage = async (senderId: string, recipientId: string, content: string): Promise<void> => {
  await addDoc(collection(db, "messages"), {
    senderId,
    recipientId,
    content,
    timestamp: new Date(),
  });
};

export const fetchMessages = async (userId: string, contactId: string, last?: DocumentSnapshot): Promise<{
  messages: any[];
  last: DocumentSnapshot | undefined;
}> => {
  const base = query(
    collection(db, "messages"),
    where("senderId", "in", [userId, contactId]),
    where("recipientId", "in", [userId, contactId]),
    orderBy("timestamp", "asc"),
    limit(20)
  );
  const q = last ? query(base, startAfter(last)) : base;
  const snapshot = await getDocs(q);
  return {
    messages: snapshot.docs.map(doc => doc.data()),
    last: snapshot.docs[snapshot.docs.length - 1] || last,
  };
};
