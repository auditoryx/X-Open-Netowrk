'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/firebase/firebaseConfig';
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import Link from 'next/link';

export default function SupportTicketPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'supportMessages', id as string), (snap) => {
      if (snap.exists()) {
        setTicket({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    await updateDoc(doc(db, 'supportMessages', id as string), {
      replies: arrayUnion({
        text: reply,
        createdAt: serverTimestamp(),
      }),
      status: 'resolved',
    });
    setReply('');
    alert('✅ Reply sent and marked as resolved.');
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!ticket) return <div className="p-6 text-white">Ticket not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto text-white">
      <Link href="/dashboard/admin/support" className="text-sm text-blue-400 underline">
        ← Back to Tickets
      </Link>

      <h1 className="text-2xl font-bold mt-4">📝 Support Ticket</h1>

      <div className="bg-zinc-800 p-4 rounded mt-4 space-y-2">
        <p><strong>Email:</strong> {ticket.email}</p>
        <p><strong>UID:</strong> {ticket.uid}</p>
        <p><strong>Status:</strong> {ticket.status}</p>
        <p className="mt-4"><strong>Message:</strong></p>
        <p className="whitespace-pre-line">{ticket.message}</p>

        {ticket.replies?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold">Previous Replies:</h2>
            <ul className="space-y-2 mt-2">
              {ticket.replies.map((r: any, i: number) => (
                <li key={i} className="text-sm text-green-300">
                  {r.text} —{' '}
                  <span className="text-xs text-gray-400">
                    {r.createdAt?.toDate?.().toLocaleString() || ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2">
        <textarea
          placeholder="Write a reply..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="w-full p-2 border rounded text-black"
          rows={4}
        />
        <button
          onClick={sendReply}
          className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
        >
          Reply + Mark Resolved
        </button>
      </div>
    </div>
  );
}
