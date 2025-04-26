'use client';
import { useEffect, useState } from "react";
import { sendMessage, fetchMessages } from "../lib/messageHelpers";

export default function MessageCenter({ userId, contactId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const getMessages = async () => {
      const msgs = await fetchMessages(userId, contactId);
      setMessages(msgs);
    };
    getMessages();
  }, [userId, contactId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(userId, contactId, input);
    setInput("");
    const msgs = await fetchMessages(userId, contactId);
    setMessages(msgs);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md text-white">
      <h2 className="text-xl font-bold mb-4">Messages</h2>
      <div className="h-64 overflow-y-scroll border border-gray-700 p-4 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.senderId === userId ? "text-right" : "text-left"}`}>
            <span className="block bg-gray-700 p-2 rounded">{msg.content}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 rounded bg-gray-800 text-white" placeholder="Type a message..." />
        <button onClick={handleSend} className="bg-blue-500 px-4 py-2 rounded text-white">Send</button>
      </div>
    </div>
  );
}
