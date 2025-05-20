'use client'

import React, { useEffect, useState } from 'react'
import { listenToMessages } from '@/lib/firestore/chat/getMessages'
import { sendMessage } from '@/lib/firestore/chat/sendMessage'
import { useAuth } from '@/lib/hooks/useAuth'
import { format } from 'date-fns'

type Props = {
  bookingId: string
}

const BookingChatThread = ({ bookingId }: Props) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    const unsub = listenToMessages(bookingId, (msgs) => {
      setMessages(msgs)
      setTimeout(() => {
        const el = document.getElementById('chat-scroll-anchor')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    })

    return () => unsub()
  }, [bookingId])

  const handleSend = async () => {
    if (!text.trim() || !user) return
    await sendMessage({ bookingId, senderId: user.uid, text })
    setText('')
  }

  return (
    <div className="border mt-4 rounded-xl p-4 max-w-xl">
      <h3 className="font-semibold text-lg mb-2">Messages</h3>
      <div className="max-h-64 overflow-y-auto mb-3 space-y-2">
        {messages.map((m, i) => {
          const isMe = m.senderId === user?.uid
          const time = m.timestamp?.toDate ? format(m.timestamp.toDate(), 'HH:mm') : ''

          return (
            <div
              key={i}
              className={`max-w-xs text-sm p-2 rounded relative ${
                isMe ? 'bg-black text-white ml-auto' : 'bg-gray-200'
              }`}
            >
              <div>{m.text}</div>
              <div className="text-[10px] opacity-60 mt-1">{time}</div>
            </div>
          )
        })}
        <div id="chat-scroll-anchor" />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="bg-black text-white px-4 py-1 text-sm rounded"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default BookingChatThread
