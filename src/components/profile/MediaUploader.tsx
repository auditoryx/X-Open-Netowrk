'use client'

import React, { useState } from 'react'
import { uploadMediaFile } from '@/lib/firebase/uploadMedia'
import { saveMediaSamples } from '@/lib/firestore/saveMediaSamples'
import { useAuth } from '@/lib/hooks/useAuth'

const MediaUploader = () => {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (!user) return
    setUploading(true)

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const type = file.type.startsWith('image')
          ? 'image'
          : file.type.startsWith('video')
          ? 'video'
          : 'audio'
        const url = await uploadMediaFile(file, user.uid, type)
        return { type, url }
      })
    )

    await saveMediaSamples(user.uid, uploaded)
    setUploading(false)
    alert('Upload successful!')
  }

  return (
    <div className="p-4 border rounded-xl shadow-sm bg-white">
      <label className="block mb-2 font-medium text-sm">Upload Media Samples</label>
      <input type="file" multiple accept="image/*,audio/*,video/*" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-3 bg-black text-white px-4 py-2 rounded-lg"
      >
        {uploading ? 'Uploading…' : 'Upload'}
      </button>
    </div>
  )
}

export default MediaUploader
