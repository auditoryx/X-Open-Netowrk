'use client'

import { AiFillStar, AiOutlineStar } from 'react-icons/ai'
import { useState } from 'react'

export type StarRatingProps = {
  value?: number
  onChange?: (val: number) => void
  max?: number
}

export default function StarRating({ value = 0, onChange, max = 5 }: StarRatingProps) {
  const [internal, setInternal] = useState(value)
  const rating = value ?? internal

  const update = (val: number) => {
    if (onChange) {
      onChange(val)
    } else {
      setInternal(val)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault()
        update(Math.min(max, index + 1))
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault()
        update(Math.max(1, index - 1))
        break
      case ' ':
      case 'Enter':
        e.preventDefault()
        update(index)
        break
    }
  }

  return (
    <div role="radiogroup" className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          role="radio"
          aria-checked={rating >= n}
          tabIndex={0}
          onClick={() => update(n)}
          onKeyDown={(e) => handleKeyDown(e, n)}
          className="cursor-pointer text-xl"
        >
          {rating >= n ? <AiFillStar className="text-yellow-500" /> : <AiOutlineStar />}
        </span>
      ))}
    </div>
  )
}
