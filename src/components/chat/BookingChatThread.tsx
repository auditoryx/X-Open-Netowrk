'use client'

import React, { useEffect, useState } from 'react'
import { getMessages } from '@/lib/firestore/chat/getMessages'
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
    const load = async () => {
      const msgs = await getMessages(bookingId)
      setMessages(msgs)
    }
    load()
  }, [bookingId])

  const handleSend = async () => {
    if (!text.trim() || !user) return
    await sendMessage({ bookingId, senderId: user.uid, text })
    setText('')
    const msgs = await getMessages(bookingId)
    setMessages(msgs)
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
              {time && (
                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-gray-400' : 'text-gray-500'}`}>
                  {time}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-2">
        <input
          className="border p-2 flex-1 rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message..."
        />
        <button onClick={handleSend} className="bg-black text-white px-3 py-2 rounded">Send</button>
      </div>
    </div>
  )
}

export default BookingChatThread
