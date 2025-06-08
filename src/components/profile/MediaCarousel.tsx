'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai'

export default function MediaCarousel({ items = [] }: { items: string[] }) {
  const [index, setIndex] = useState(0)
  if (!items.length) return null

  const prev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1))
  const next = () => setIndex((i) => (i === items.length - 1 ? 0 : i + 1))

  const handleKey = (cb: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      cb()
    }
  }

  const url = items[index]
  const isVideo = url.includes('youtube') || url.includes('vimeo')

  return (
    <div className="relative w-full max-w-xl mx-auto" aria-label="media carousel">
      <div className="overflow-hidden rounded">
        {isVideo ? (
          <iframe
            src={url}
            title={`media-${index}`}
            className="w-full h-64"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <Image
            src={url}
            alt={`media-${index}`}
            width={640}
            height={360}
            className="w-full h-64 object-cover"
          />
        )}
      </div>
      <span
        role="button"
        tabIndex={0}
        aria-label="Previous"
        onClick={prev}
        onKeyDown={handleKey(prev)}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full cursor-pointer"
      >
        <AiOutlineLeft />
      </span>
      <span
        role="button"
        tabIndex={0}
        aria-label="Next"
        onClick={next}
        onKeyDown={handleKey(next)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full cursor-pointer"
      >
        <AiOutlineRight />
      </span>
    </div>
  )
}
