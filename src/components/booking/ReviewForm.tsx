'use client'

import React, { useState } from 'react'
import { submitReview } from '@/lib/firestore/submitReview'
import { useAuth } from '@/lib/hooks/useAuth'

type Props = {
  bookingId: string
  providerId: string
}

const ReviewForm = ({ bookingId, providerId }: Props) => {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!user || !text || !rating) return
    await submitReview({ bookingId, providerId, clientId: user.uid, text, rating })
    setSubmitted(true)
  }

  return (
    <div className="mt-4 p-4 border rounded-xl">
      <h3 className="font-medium mb-2">Leave a Review</h3>
      <textarea
        placeholder="Write your review..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm">Rating:</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} ⭐
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleSubmit}
        disabled={submitted}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {submitted ? 'Submitted' : 'Submit Review'}
      </button>
    </div>
  )
}

export default ReviewForm
