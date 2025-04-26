'use client'

import React, { useEffect, useState } from 'react'
import { getMessages } from '@/lib/firestore/chat/getMessages'
import { sendMessage } from '@/lib/firestore/chat/sendMessage'
import { useAuth } from '@/lib/hooks/useAuth'

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
        {messages.map((m, i) => (
          <div key={i} className={`text-sm p-2 rounded ${m.senderId === user?.uid ? 'bg-black text-white ml-auto' : 'bg-gray-200'}`}>
            {m.text}
          </div>
        ))}
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
