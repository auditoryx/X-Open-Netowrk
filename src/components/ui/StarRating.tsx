'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

export type StarRatingProps = {
  value?: number
  onChange?: (val: number) => void
  max?: number
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function StarRating({ 
  value = 0, 
  onChange, 
  max = 5, 
  disabled = false,
  size = 'md',
  className = '' 
}: StarRatingProps) {
  const [internal, setInternal] = useState(value)
  const [hovered, setHovered] = useState(0)
  
  const rating = value ?? internal
  const displayRating = hovered || rating

  const update = (val: number) => {
    if (disabled) return
    
    if (onChange) {
      onChange(val)
    } else {
      setInternal(val)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>, index: number) => {
    if (disabled) return
    
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

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div role="radiogroup" className={`flex gap-1 ${className}`} aria-label={`Rating ${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          role="radio"
          aria-checked={rating >= n}
          tabIndex={disabled ? -1 : 0}
          onClick={() => update(n)}
          onMouseEnter={() => !disabled && setHovered(n)}
          onMouseLeave={() => !disabled && setHovered(0)}
          onKeyDown={(e) => handleKeyDown(e, n)}
          className={`
            ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer hover:scale-110'} 
            ${sizeClasses[size]}
            transition-transform duration-150
          `}
        >
          {displayRating >= n ? 
            <Star className="text-yellow-500 fill-yellow-500" /> : 
            <Star className="text-gray-300" />
          }
        </span>
      ))}
    </div>
  )
}