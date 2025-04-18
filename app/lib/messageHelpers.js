import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";

export const sendMessage = async (senderId, recipientId, content) => {
  await addDoc(collection(db, "messages"), {
    senderId,
    recipientId,
    content,
    timestamp: new Date(),
  });
};

export const fetchMessages = async (userId, contactId) => {
  const q = query(
    collection(db, "messages"),
    where("senderId", "in", [userId, contactId]),
    where("recipientId", "in", [userId, contactId]),
    orderBy("timestamp", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};
