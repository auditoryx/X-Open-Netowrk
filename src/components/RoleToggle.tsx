'use client'

import { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const roles = ['artist', 'producer', 'studio', 'videographer', 'engineer']

export default function RoleToggle() {
  const [selectedRole, setSelectedRole] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const user = auth.currentUser
    if (user && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      setIsAdmin(true)
    }
  }, [])

  const handleSetRole = async () => {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return alert("No user logged in.")
    if (!isAdmin) return alert("Unauthorized.")

    await setDoc(doc(db, 'users', user.uid), {
      role: selectedRole
    }, { merge: true })

    alert(`Role updated to ${selectedRole}`)
  }

  if (!isAdmin) return null

  return (
    <div className="p-4 space-y-2 border rounded">
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="p-2 border rounded w-full"
      >
        <option value="">Select Role</option>
        {roles.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <button
        onClick={handleSetRole}
        className="px-4 py-2 bg-black text-white rounded w-full"
      >
        Set Role
      </button>
    </div>
  )
}
