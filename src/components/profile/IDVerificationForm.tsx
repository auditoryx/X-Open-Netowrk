'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'

export default function IDVerificationForm() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid || !file || loading) return
    setLoading(true)
    try {
      const storage = getStorage()
      const fileRef = ref(storage, `id-verifications/${user.uid}/${file.name}`)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)

      await updateDoc(doc(db, 'users', user.uid), {
        verificationStatus: 'pending',
        idDocumentUrl: url,
      })

      toast.success('ID submitted successfully!')
      setSubmitted(true)
    } catch (e) {
      console.error(e)
      toast.error('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <p className="text-green-400 text-sm">✅ Your ID has been submitted and is under review.</p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900 p-4 rounded-xl text-white space-y-3">
      <h2 className="text-lg font-bold">Verify Your Identity</h2>
      <p className="text-sm text-gray-400">Upload a photo or scan of your government ID.</p>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="bg-neutral-800 border border-neutral-700 rounded p-2 w-full text-white"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={!file || loading}
        className="bg-blue-600 px-4 py-2 rounded text-white"
      >
        {loading ? 'Submitting...' : 'Submit Verification'}
      </button>
    </form>
  )
}
