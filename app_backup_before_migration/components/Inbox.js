'use client';

import { useState, useEffect } from 'react';

export default function Inbox({ userId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Placeholder for real-time listener to Firestore
    setMessages([
      { from: "admin@auditoryx.com", message: "Welcome to the AuditoryX Network!" }
    ]);
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Inbox</h2>
      {messages.length === 0 ? (
        <p>No messages.</p>
      ) : (
        <ul className="space-y-2">
          {messages.map((msg, idx) => (
            <li key={idx} className="bg-white text-black p-3 rounded shadow">
              <strong>From:</strong> {msg.from} <br />
              <span>{msg.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
