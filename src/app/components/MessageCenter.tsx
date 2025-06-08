'use client'
import { useEffect, useRef, useState, Fragment } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { markConversationMessagesAsSeen } from '@/lib/firestore/chat/markConversationMessagesAsSeen'
import { format } from 'date-fns'
import { uploadChatMedia } from '@/lib/firebase/uploadChatMedia'

interface Props {
  userId: string
  contactId: string
}

interface Message {
  id: string
  senderId: string
  content?: string
  mediaUrl?: string
  timestamp?: any
  seenBy?: string[]
}

export default function MessageCenter({ userId, contactId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const convoId = [userId, contactId].sort().join('_')

  useEffect(() => {
    const q = query(
      collection(db, 'conversations', convoId, 'messages'),
      orderBy('timestamp', 'asc')
    )
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
      setMessages(msgs)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      if (userId) {
        markConversationMessagesAsSeen(convoId, userId)
      }
    })
    return () => unsub()
  }, [convoId, userId])

  const handleSend = async () => {
    if (!input.trim() && !file) return

    let mediaUrl: string | null = null
    if (file) {
      mediaUrl = await uploadChatMedia(convoId, file)
    }

    await addDoc(collection(db, 'conversations', convoId, 'messages'), {
      senderId: userId,
      content: input.trim(),
      mediaUrl,
      timestamp: serverTimestamp(),
      seenBy: [userId]
    })

    setInput('')
    setFile(null)
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md text-white">
      <h2 className="text-xl font-bold mb-4">Messages</h2>
      <div className="h-64 overflow-y-scroll border border-gray-700 p-4 mb-4">
        {messages.map((msg, idx) => {
          const prev = messages[idx - 1]
          const msgDate = format(
            msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(),
            'MMM d'
          )
          const prevDate = prev
            ? format(prev.timestamp?.toDate ? prev.timestamp.toDate() : new Date(), 'MMM d')
            : null
          const showDate = idx === 0 || msgDate !== prevDate
          const time = format(
            msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(),
            'HH:mm'
          )
          return (
            <Fragment key={msg.id}>
              {showDate && (
                <div className="text-center text-xs text-gray-500 my-2">{msgDate}</div>
              )}
              <div
                className={`mb-2 ${msg.senderId === userId ? 'text-right' : 'text-left'}`}
              >
                {msg.mediaUrl && (
                  msg.mediaUrl.endsWith('.mp3') ? (
                    <audio controls src={msg.mediaUrl} className="mb-1 mx-auto" />
                  ) : (
                    <img src={msg.mediaUrl} className="w-32 rounded mb-1 mx-auto" />
                  )
                )}
                {msg.content && (
                  <span className="block bg-gray-700 p-2 rounded">{msg.content}</span>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {time}
                  {msg.senderId === userId && msg.seenBy?.includes(contactId) && (
                    <span className="text-blue-400 ml-1">✓✓</span>
                  )}
                </div>
              </div>
            </Fragment>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex flex-col gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-800 text-white"
          placeholder="Type a message..."
        />
        <input
          type="file"
          accept="image/*,audio/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        <button onClick={handleSend} className="bg-blue-500 px-4 py-2 rounded text-white">
          Send
        </button>
      </div>
    </div>
  )
}
