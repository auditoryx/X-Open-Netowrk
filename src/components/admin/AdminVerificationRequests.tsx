'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore'
import { approveUserVerification } from '@/lib/firestore/approveUserVerification'

interface Request {
  id: string
  email: string
  idDocumentUrl?: string
}

export default function AdminVerificationRequests() {
  const [requests, setRequests] = useState<Request[]>([])

  useEffect(() => {
    async function fetchRequests() {
      const q = query(collection(db, 'users'), where('verificationStatus', '==', 'pending'))
      const snap = await getDocs(q)
      setRequests(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    }
    fetchRequests()
  }, [])

  const approve = async (id: string) => {
    await approveUserVerification(id)
    setRequests(r => r.filter(req => req.id !== id))
  }

  const reject = async (id: string) => {
    await updateDoc(doc(db, 'users', id), { verificationStatus: 'rejected' })
    setRequests(r => r.filter(req => req.id !== id))
  }

  if (!requests.length) return <p>No pending verification requests.</p>

  return (
    <div className="space-y-4">
      {requests.map(req => (
        <div key={req.id} className="border p-4 rounded-md">
          <p><b>Email:</b> {req.email}</p>
          {req.idDocumentUrl && (
            <a href={req.idDocumentUrl} target="_blank" className="text-blue-400 underline" rel="noreferrer">View ID</a>
          )}
          <div className="mt-2 space-x-2">
            <button onClick={() => approve(req.id)} className="btn btn-primary text-sm">Approve</button>
            <button onClick={() => reject(req.id)} className="btn btn-secondary text-sm">Reject</button>
          </div>
        </div>
      ))}
    </div>
  )
}
