'use client'

import React, { useRef, useState } from 'react'
import { uploadMediaFile } from '@/lib/firebase/uploadMedia'
import { saveMediaSamples } from '@/lib/firestore/saveMediaSamples'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'

const MediaUploader = () => {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { user } = useAuth()

  const addFiles = (newFiles: File[]) => {
    const allowed = newFiles.filter((f) => {
      if (f.type.startsWith('video') && f.size > 5 * 1024 * 1024) {
        toast.error('Video files must be under 5MB')
        return false
      }
      return true
    })
    setFiles((prev) => [...prev, ...allowed])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    addFiles(Array.from(e.dataTransfer.files))
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
      <label htmlFor="media-upload" className="block mb-2 font-medium text-sm">Upload Media Samples</label>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded p-6 text-center cursor-pointer"
      >
        <p className="text-sm text-gray-600">Drag & drop files here or click to browse</p>
        <input
          id="media-upload"
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,audio/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">Accepted formats: images, audio, video. Max 5MB for video.</p>
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-3 btn btn-primary"
      >
        {uploading ? 'Uploading…' : 'Upload'}
      </button>
    </div>
  )
}

export default MediaUploader
