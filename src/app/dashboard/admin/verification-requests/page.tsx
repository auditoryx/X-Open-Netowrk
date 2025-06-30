'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { approveUserVerification } from '@/lib/firestore/approveUserVerification'
import { db } from '@/lib/firebase'

export default function VerificationRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, 'users'))
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(d => d.verificationStatus === 'pending')
      setRequests(data)
    }
    fetch()
  }, [])

  const approve = async (uid: string) => {
    await approveUserVerification(uid)
    setRequests(r => r.filter(r => r.id !== uid))
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Pending Verifications</h1>
      {requests.map((r) => (
        <div key={r.id} className="mb-4 border-b border-white pb-3">
          <p><strong>{r.name}</strong> ({r.email})</p>
          <a href={r.idDocumentUrl} target="_blank" className="underline text-blue-400" rel="noreferrer">View ID</a>
          <button onClick={() => approve(r.id)} className="ml-4 bg-green-600 px-3 py-1 rounded">
            Approve
          </button>
        </div>
      ))}
    </div>
  )
}
