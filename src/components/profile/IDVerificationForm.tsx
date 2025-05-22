'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'

export default function IDVerificationForm() {
  const { user } = useAuth()
  const [idUrl, setIdUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const handleSubmit = async () => {
    if (!user || !idUrl) return
    setLoading(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        verificationStatus: 'pending',
        idDocumentUrl: idUrl,
      })
      setStatus('Submitted')
    } catch (e) {
      console.error(e)
      setStatus('Error submitting')
    }
    setLoading(false)
  }

  return (
    <div className="bg-neutral-900 p-4 rounded-xl text-white space-y-3">
      <h2 className="text-lg font-bold">Verify Your Identity</h2>
      <p className="text-sm text-gray-400">Upload a link to your ID (or a screenshot).</p>
      <input
        type="url"
        placeholder="Paste image URL"
        value={idUrl}
        onChange={(e) => setIdUrl(e.target.value)}
        className="bg-neutral-800 border border-neutral-700 rounded p-2 w-full text-white"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 px-4 py-2 rounded text-white"
      >
        {loading ? 'Submitting...' : 'Submit Verification'}
      </button>
      {status && <p className="text-sm mt-2 text-green-400">{status}</p>}
    </div>
  )
}
