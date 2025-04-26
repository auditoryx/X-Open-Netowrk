'use client'

import React, { useEffect, useState } from 'react'
import { getMediaSamples } from '@/lib/firestore/getMediaSamples'
import { useAuth } from '@/lib/hooks/useAuth'

type Media = {
  type: string
  url: string
}

const MediaGallery = () => {
  const [samples, setSamples] = useState<Media[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      getMediaSamples(user.uid).then(setSamples)
    }
  }, [user])

  if (!user) return null
  if (!samples.length) return <p>No media uploaded yet.</p>

  return (
    <div className="grid gap-4 mt-4">
      {samples.map((sample, idx) => (
        <div key={idx} className="border rounded-xl p-2">
          {sample.type === 'image' && (
            <img src={sample.url} alt="media" className="w-full max-w-xs rounded" />
          )}
          {sample.type === 'video' && (
            <video controls src={sample.url} className="w-full max-w-xs rounded" />
          )}
          {sample.type === 'audio' && (
            <audio controls src={sample.url} className="w-full" />
          )}
        </div>
      ))}
    </div>
  )
}

export default MediaGallery
